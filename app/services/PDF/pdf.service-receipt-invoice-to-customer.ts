import { db } from "@/lib/db";
import {
  Contact,
  Invoice,
  Quotation,
  QuotationList,
  User,
} from "@prisma/client";
import { PDFDocument, PDFEmbeddedPage, PDFFont, PDFPage } from "pdf-lib";
import { getBoundingBox, PDFDateFormat, loadPdfAssets, validatePageArea, getTextWidth, getPaymentCondition, getBillDueDate, convertToThaiBahtText, getCustomerNameWithBranch, formatInstallmentText } from "./pdf.helpers";
import { QuotationInstallmentWithRelations } from "@/types";

type QuotationWithRelations = Quotation & {
  lists?: QuotationList[];
  contact?: Contact | null;
  seller?: User | null;
  invoices?: Invoice[]; // Changed from invoice to invoices array
  installmentData?: QuotationInstallmentWithRelations | null;
};

let _BILL_DATE = ""
let _DATA: QuotationWithRelations | null = null
let _INSTALLMENT_DATA: QuotationInstallmentWithRelations | null = null;
let _FONT: PDFFont | null = null;

// item list config
const PAGE_FONT_SIZE = 8;
const LIST_END_AT = 210;
const ITEM_Y_Start = 595;
const ITEM_X_Start = 65;

// horizontal position
const columnPosition = {
  index: ITEM_X_Start - 10,
  description: ITEM_X_Start + 20,
  quantity: ITEM_X_Start + 349,
  unit: ITEM_X_Start + 390,
  unitPrice: ITEM_X_Start + 385,
  amount: ITEM_X_Start + 465,
};


const CURRENCY_FORMAT = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};


const getData = async (
  id: number,
  defaultDate: string,
  installmentId?: number
): Promise<QuotationWithRelations | null> => {
  const quotation = await db.quotation.findUnique({
    include: {
      lists: {
        where: {
          hiddenInPdf: false, // only include items that are not hidden in PDF
        },
        orderBy: {
          order: "asc", // order by the order field
        },
      },
      contact: true,
      seller: true,
      invoices: true, // Changed from invoice to invoices
    },
    where: {
      id: parseInt(id.toString()),
    },
  });

  // Get the most recent invoice for this quotation (for regular invoices)
  const invoice = quotation?.invoices?.[0] || null;
  const invoiceDate = invoice?.receiptDate ?? defaultDate;
  _BILL_DATE = PDFDateFormat(new Date(invoiceDate));

  // If installment ID is provided, fetch installment data
  if (installmentId && quotation) {
    const installment = await db.quotationInstallment.findUnique({
      where: { id: installmentId },
      include: {
        invoice: true,
      },
    });

    if (installment) {
      _INSTALLMENT_DATA = installment;

      // Use installment invoice receipt date if available
      if (installment.invoice?.receiptDate) {
        _BILL_DATE = PDFDateFormat(new Date(installment.invoice?.receiptDate));
      }
    }
  }

  return quotation;
};

export const generateInvoice = async (id: number, defaultDate: string, installmentId?: number) => {
  try {
    if (!id) {
      throw new Error("Invalid quotation ID");
    }

    // Reset installment data
    _INSTALLMENT_DATA = null;

    const quotation = await getData(id, defaultDate, installmentId);

    if (!quotation) {
      throw new Error("PurchaseOrder not found");
    }

    _DATA = quotation;
    return main();
  } catch (error) {
    console.log(error);
    throw new Error("Error writing PDF file");
  }
};

const main = async () => {
  if (!_DATA) return;
  // list start position

  const templates = [
    "pdf/service-receipt-invoice-to-customer-template.pdf"
  ];

  let results = []

  for (const templatePath of templates) {
    const { pdfDoc, font, template } = await loadPdfAssets(templatePath);
    _FONT = font;

    const config = {
      size: PAGE_FONT_SIZE,
      lineHeight: 11,
      font: _FONT,
    };

    const totalPages = 3

    // loop through all pages
    for (let i = 0; i < totalPages; i++) {
      const templatePage = await pdfDoc.embedPage(template.getPages()[i]);
      let page = pdfDoc.addPage();
      page.drawPage(templatePage);

      drawStaticInfo(page, i + 1);

      drawItemLists(
        page,
        pdfDoc,
        templatePage,
        config
      )
    }

    const modifiedPdfBytes = await pdfDoc.save();

    results.push({
      pdfBytes: modifiedPdfBytes,
    });
    // Save or return the modified PDF bytes as needed
  }

  return results;
};

const drawItemLists = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  templatePage: PDFEmbeddedPage,
  config: {
    font: PDFFont;
    size: number;
    lineHeight: number;
  }
) => {
  if (!_DATA || !_FONT) return;

  let lineStart = ITEM_Y_Start;

  // write item list
  _DATA?.lists?.forEach((list, index) => {
    if (index > 0) {
      lineStart -= config.lineHeight; // space between main items
    }

    const mainItemRes = validatePageArea(
      page,
      pdfDoc,
      templatePage,
      lineStart,
      LIST_END_AT,
      ITEM_Y_Start,
      (currentPage: PDFPage, currentLineStart: number) =>
        writeMainItem(currentPage, index, list, currentLineStart, config, pdfDoc)
    );
    lineStart = mainItemRes.lineStart;
    page = mainItemRes.page;

    if (list.description) {
      const mainDescriptionRes = validatePageArea(
        page,
        pdfDoc,
        templatePage,
        lineStart,
        LIST_END_AT,
        ITEM_Y_Start,
        (currentPage: PDFPage, currentLineStart: number) =>
          writeMainDescription(
            currentPage,
            list.description ?? "",
            currentLineStart,
            config,
            pdfDoc
          )
      );

      lineStart = mainDescriptionRes.lineStart;
      page = mainDescriptionRes.page;
    }
  });

}

const writeMainItem = (
  currentPage: PDFPage,
  index: number,
  data: QuotationList,
  lineStart: number,
  config: {
    font: PDFFont;
    size: number;
    lineHeight: number;
  },
  pdfDoc: PDFDocument
) => {
  currentPage.drawText((index + 1).toString(), {
    x: columnPosition.index,
    y: lineStart,
    maxWidth: 20,
    ...config,
  });

  const itemName = `${data.allowedWithholdingTax ? "(**)" : ""} ${data.name}`;

  currentPage.drawText(itemName, {
    x: columnPosition.description,
    y: lineStart,
    maxWidth: 300,
    ...config,
    // lineHeight: breakLineHeight,
  });

  // Quantity
  currentPage.drawText(data.quantity ? data.quantity.toString() : "", {
    x: columnPosition.quantity,
    y: lineStart,
    maxWidth: 20,
    ...config,
  });


  // Use installment amounts if available, otherwise use original list data
  const unitPriceValue = _INSTALLMENT_DATA ? 
    _INSTALLMENT_DATA.amount :
    (data.unitPrice || 0);
  const unitPrice = unitPriceValue.toLocaleString("th-TH", CURRENCY_FORMAT);

  currentPage.drawText(unitPrice, {
    x: columnPosition.unitPrice + 44 - getTextWidth(unitPrice, config),
    y: lineStart,
    maxWidth: 20,
    ...config,
  });

  const amountValue = _INSTALLMENT_DATA ?
    _INSTALLMENT_DATA.amount :
    (data.price || 0);
  const amountText = amountValue.toLocaleString("th-TH", CURRENCY_FORMAT);
    
  currentPage.drawText(amountText, {
    x: columnPosition.amount + 44 - getTextWidth(amountText, config),
    y: lineStart,
    maxWidth: 50,
    ...config,
  });

  const bounding = getBoundingBox(
    data.name,
    pdfDoc,
    _FONT,
    PAGE_FONT_SIZE,
    config.lineHeight + 4,
    300
  );

  return bounding.height / 10;
};

const writeMainDescription = (
  currentPage: PDFPage,
  description: string,
  lineStart: number,
  config: {
    font: PDFFont;
    size: number;
    lineHeight: number;
  },
  pdfDoc: PDFDocument
) => {
  let currentY = lineStart;
  let totalHeight = 0;

  // Draw the original description
  currentPage.drawText(description, {
    x: columnPosition.description + 12, // indent
    y: currentY,
    maxWidth: 300,
    ...config,
    opacity: 0.5,
  });

  const descriptionBounding = getBoundingBox(
    description,
    pdfDoc,
    _FONT,
    PAGE_FONT_SIZE,
    config.lineHeight + 4,
    300
  );
  totalHeight += descriptionBounding.height / 10;
  currentY -= descriptionBounding.height / 10;

  // Add installment period if installment data exists
  if (_INSTALLMENT_DATA) {
    const installmentText = formatInstallmentText(
      _INSTALLMENT_DATA,
      _DATA?.installmentContractNumber
    );

    currentY -= config.lineHeight; // Add some spacing

    currentPage.drawText(installmentText, {
      x: columnPosition.description + 12, // indent same as description
      y: currentY,
      maxWidth: 300,
      ...config,
      opacity: 0.7,
    });

    const installmentBounding = getBoundingBox(
      installmentText,
      pdfDoc,
      _FONT,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      300
    );
    totalHeight += config.lineHeight + installmentBounding.height / 10;
  }

  return totalHeight;
};

const drawHeaderInfo = (
  page: PDFPage,
) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 16,
  };

  page.drawText("1", {
    x: 530,
    y: 790,
    maxWidth: 100,
    ...config,
  });
};

const drawCustomerInfo = (page: PDFPage) => {
  if (!_DATA || !_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  const customer = {
    ..._DATA?.contact,
    name: _DATA?.contact?.name ?? "",
    branchId: _DATA?.contact?.branchId ?? "",
    contact: _DATA?.overrideContactName ?? _DATA?.contact?.contact,
    email: _DATA?.overrideContactEmail ?? _DATA?.contact?.email,
    phone: _DATA?.overrideContactPhone ?? _DATA?.contact?.phone,
  }
    if (!customer) {
    return
  }

  const Y_Start = 702;
  const X_Start = 85;
  page.drawText(customer.branchId ?? "", {
    x: X_Start,
    y: Y_Start,
    maxWidth: 600,
    ...config,
  });

  page.drawText(getCustomerNameWithBranch(customer.name, customer.branchId), {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 500,
    ...config,
  });

  page.drawText(customer.address ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 350,
    ...config,
  });

  // combine taxId, branchId
  // const taxInfo = [
  //   customer.taxId,
  //   customer.branchId ? `สาขาที่ ${customer.branchId}` : "",
  // ]
  //   .filter((item) => item)
  //   .join(", ");


  page.drawText(customer.taxId ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight * 4,
    maxWidth: 500,
    ...config,
  });

  // combine contact, phone, fax, email
  const contactInfo = [
    customer.contact,
    customer.phone,
    customer.fax,
    // customer.email,
  ]
    .filter((item) => item)
    .join(", ");

  page.drawText(contactInfo, {
    x: X_Start,
    y: Y_Start - config.lineHeight * 5,
    maxWidth: 500,
    ...config,
  });


  // right side
  const quotation = _DATA

  const rightXStart = 500;

  let receiptCode = quotation?.invoices?.[0]?.receiptCode ?? "";

  if (_INSTALLMENT_DATA) {
    // Use installment receipt code if available
    receiptCode = _INSTALLMENT_DATA.invoice?.receiptCode ?? receiptCode;
  }
  // code
  page.drawText(receiptCode, {
    x: rightXStart,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });

  // date
  page.drawText(_BILL_DATE, {
    x: rightXStart,
    y: Y_Start - config.lineHeight,
    maxWidth: 100,
    ...config,
  });


  const seller = quotation?.seller;
  page.drawText(seller?.name ?? "", {
    x: rightXStart,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });

  page.drawText(quotation?.purchaseOrderRef ?? "", {
    x: rightXStart,
    y: Y_Start - config.lineHeight * 5,
    maxWidth: 100,
    ...config,
  });

  const paymentCondition = getPaymentCondition(quotation?.paymentCondition ?? "");
  page.drawText(paymentCondition, {
    x: rightXStart,
    y: Y_Start - config.lineHeight * 3,
    maxWidth: 100,
    ...config,
  });

  const dueDate = getBillDueDate(new Date(_BILL_DATE), quotation?.paymentCondition ?? "");
  page.drawText(PDFDateFormat(dueDate), {
    x: rightXStart,
    y: Y_Start - config.lineHeight * 4,
    maxWidth: 100,
    ...config,
  });


};

const drawPriceInfo = (
  page: PDFPage,
  {
    totalPrice,
    discount,
    tax,
    grandTotal,
  }: {
    totalPrice: string;
    discount: string;
    tax: string;
    grandTotal: string;
  }
) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 15,
  };

  const columnPosition = 574;
  const Start_Y = 182;

  page.drawText(totalPrice, {
    x: columnPosition - getTextWidth(totalPrice, config),
    y: Start_Y,
    maxWidth: 100,
    ...config,
  });

  page.drawText(tax, {
    x: columnPosition - getTextWidth(tax, config),
    y: Start_Y - config.lineHeight,
    maxWidth: 100,
    ...config,
  });

  page.drawText(grandTotal, {
    x: columnPosition - getTextWidth(grandTotal, config),
    y: Start_Y - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });

  // Price text - use installment amount if available, otherwise use grandTotal
  const amountForThaiBaht = _INSTALLMENT_DATA ? 
    _INSTALLMENT_DATA.amountWithVat : 
    parseFloat(grandTotal.replace(/,/g, ""));
    
  const thaiBahtText = convertToThaiBahtText(amountForThaiBaht);
  page.drawText(thaiBahtText, {
    x: ITEM_X_Start + 30,
    y: Start_Y - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });
};

const drawStaticInfo = (
  page: PDFPage,
  currentPageNumber: number
) => {
  if (!_DATA) return;

  drawHeaderInfo(page);

  drawCustomerInfo(page);

  drawPriceInfo(page, {
    discount: _DATA?.discount?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "",
    tax: _INSTALLMENT_DATA ? 
      (_INSTALLMENT_DATA.amountWithVat - _INSTALLMENT_DATA.amount).toLocaleString("th-TH", CURRENCY_FORMAT) :
      (_DATA?.tax?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? ""),
    totalPrice: _INSTALLMENT_DATA ?
      _INSTALLMENT_DATA.amount.toLocaleString("th-TH", CURRENCY_FORMAT) :
      (_DATA?.totalPrice?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? ""),
    grandTotal: _INSTALLMENT_DATA ?
      _INSTALLMENT_DATA.amountWithVat.toLocaleString("th-TH", CURRENCY_FORMAT) :
      (_DATA?.grandTotal?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? ""),
  });

};
