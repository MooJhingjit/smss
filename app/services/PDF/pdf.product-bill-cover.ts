import { db } from "@/lib/db";
import {
  Contact,
  Invoice,
  Quotation,
  QuotationList,
  User,
} from "@prisma/client";
import { PDFFont, PDFPage } from "pdf-lib";
import {
  PDFDateFormat,
  loadPdfAssets,
  getTextWidth,
  loadSignatureImage,
  convertToThaiBahtText,
} from "./pdf.helpers";
import path from "path";

type QuotationWithRelations = Quotation & {
  lists?: QuotationList[];
  contact?: Contact | null;
  seller?: User | null;
  invoice?: Invoice | null;
};

let _BILL_DATE = "";
let _DATA: QuotationWithRelations[];
let _FONT: PDFFont | null = null;

const CURRENCY_FORMAT = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

const getData = async (id: number): Promise<QuotationWithRelations[]> => {
  const quotations = await db.quotation.findMany({
    include: {
      contact: true,
      invoice: true,
    },
    where: {
      billGroupId: id,
    },
  });

  return quotations;
};

export const generateBillCover = async (billGroupId: number) => {
  try {
    const quotationWithInvoices = await getData(billGroupId);

    const billDate = quotationWithInvoices?.[0]?.invoice?.date ?? Date.now();
    _BILL_DATE = PDFDateFormat(new Date(billDate));

    if (!quotationWithInvoices.length) {
      return null;
    }

    _DATA = quotationWithInvoices;
    return main();
  } catch (error) {
    console.log(error);
    throw new Error("Error writing PDF file");
  }
};

const main = async () => {
   const folderPath =  path.resolve('./public', 'pdf/product-bill-cover.pdf')
  const { pdfDoc, font, template } = await loadPdfAssets(folderPath);
  _FONT = font;

  const totalPages = 2;
  // loop through all pages
  for (let i = 0; i < totalPages; i++) {
    const templatePage = await pdfDoc.embedPage(template.getPages()[i]);
    let page = pdfDoc.addPage();
    page.drawPage(templatePage);

    // draw biller signature
    const signature = await loadSignatureImage("1");
    const signatureImage = await page.doc.embedPng(signature.imageBytes as any);
    page.drawImage(signatureImage, {
      x: 100,
      y: 500,
      ...signatureImage.scale(signature.scale),
    });
    page.drawText(_BILL_DATE, {
      x: 70,
      y: 488,
      maxWidth: 50,
      size: 8,
      font: _FONT as PDFFont,
    });
    // end draw biller signature

    drawHeaderInfo(page);

    drawItemLists(page);
  }

  const modifiedPdfBytes = await pdfDoc.save();
  return {
    pdfBytes: modifiedPdfBytes,
  };
};

const drawItemLists = (page: PDFPage) => {
  const FONT_SIZE = 8;
  const ITEM_Y_Start = 660;
  const ITEM_X_Start = 65;

  const columnPosition = {
    index: ITEM_X_Start - 10,
    invoiceCode: ITEM_X_Start + 60,
    invoiceDate: ITEM_X_Start + 180,
    poRef: ITEM_X_Start + 290,
    total: ITEM_X_Start + 500,
  };

  const config = {
    size: FONT_SIZE,
    font: _FONT as PDFFont,
    lineHeight: 17,
  };

  //   draw invoice items
  let currentY = ITEM_Y_Start;

  let grandTotal = 0;
  _DATA.forEach((quotation, index) => {
    const invoice = quotation.invoice;
    grandTotal += invoice?.grandTotal ?? 0;

    if (!invoice) return;

    page.drawText((index + 1).toString(), {
      x: columnPosition.index,
      y: currentY,
      ...config,
    });

    page.drawText(invoice.code ?? "", {
      x: columnPosition.invoiceCode,
      y: currentY,
      maxWidth: 250,
      ...config,
    });

    const invoiceDate = invoice.date
      ? PDFDateFormat(new Date(invoice.date))
      : "";
    page.drawText(invoiceDate, {
      x: columnPosition.invoiceDate,
      y: currentY,
      ...config,
    });

    const poRef = quotation.purchaseOrderRef ?? "";
    page.drawText(poRef, {
      x: columnPosition.poRef,
      y: currentY,
      ...config,
    });

    const total = invoice.grandTotal?.toLocaleString("en-US", CURRENCY_FORMAT);
    page.drawText(total, {
      x: columnPosition.total - getTextWidth(total, config),
      y: currentY,
      maxWidth: 100,
      ...config,
    });

    currentY -= config.lineHeight;
  });

  // draw grandTotal
  const grandTotalText = grandTotal.toLocaleString("en-US", CURRENCY_FORMAT);
  page.drawText(grandTotalText, {
    x: columnPosition.total - getTextWidth(grandTotalText, config),
    y: 551,
    maxWidth: 100,
    ...config,
  });

  const thaiBahtText = convertToThaiBahtText(grandTotal);
  page.drawText(thaiBahtText, {
    x: ITEM_X_Start,
    y: 551,
    maxWidth: 100,
    ...config,
  });
};

const drawHeaderInfo = (page: PDFPage) => {
  if (!_FONT) return;
  const X_Start = 75;
  const Y_Start = 732;
  const config = {
    font: _FONT,
    size: 8,
    lineHeight: 17,
  };

  const contactRef = _DATA[0].contact ?? "";
  if (!contactRef) return;

  const name = [
    contactRef.name ?? "",
    contactRef.branchId ? `สาขา ${contactRef.branchId}` : "",
  ]
  page.drawText(name.join(" "), {
    x: X_Start,
    y: Y_Start,
    maxWidth: 500,
    ...config,
  });

  const contactDetails = [
    contactRef.address ?? "",
    "เลขประจำตัวผู้เสียภาษี " + contactRef.taxId,
  ];

  page.drawText(contactDetails.join(" "), {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 500,
    ...config,
  });

  page.drawText("Group Bill Id", {
    x: X_Start + 400,
    y: Y_Start,
    maxWidth: 50,
    ...config,
  });

  page.drawText(_BILL_DATE, {
    x: X_Start + 370,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 50,
    ...config,
  });
};
