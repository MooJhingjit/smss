import { db } from "@/lib/db";
import { Contact, Quotation, QuotationList, User } from "@prisma/client";
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  PDFEmbeddedPage,
  degrees,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  getBoundingBox,
  getCustomerNameWithBranch,
  getPaymentCondition,
  loadSignatureImage,
  PDFDateFormat,
} from "./pdf.helpers";
import { getDateFormat } from "@/lib/utils";
import path from "path";
import { readFile } from "fs/promises";
import {
  calculateQuotationItemPrice,
  // summarizeQuotationTotalPrice,
} from "../service.quotation";

const PAGE_FONT_SIZE = 8;
const CURRENCY_FORMAT = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};
let _BILL_DATE = "";
let _DATA: QuotationWithRelations | null = null;
let _FONT: PDFFont | null = null;

type QuotationWithRelations = Quotation & {
  lists: QuotationList[];
  seller: User | null;
  contact: Contact;
};

const getQuotation = async (
  id: number
): Promise<QuotationWithRelations | null> => {

  const quotation = await db.quotation.findUnique({
    include: {
      lists: {
        include: {
          product: true,
        },
      },
      seller: true,
      contact: true,
    },
    where: {
      id: parseInt(id.toString()),
    },
  });

  return quotation;
};

export const generateQuotationPaper = async (id: number, date: string) => {
  try {
    if (!id) {
      throw new Error("Invalid quotation ID");
    }

    _BILL_DATE = PDFDateFormat(new Date(date));

    const quotation = await getQuotation(id);

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    let temporaryQuotationTotalPrice = {};
    // check if total price is not yet calculated
    if (!quotation.grandTotal) {
      const { totalPrice, discount, vat, grandTotal } =
        calculateQuotationItemPrice(quotation.lists);

      temporaryQuotationTotalPrice = {
        totalPrice,
        discount,
        tax: vat,
        grandTotal,
      };
    }

    _DATA = { ...quotation, ...temporaryQuotationTotalPrice };
    return generate(id);
  } catch (error) {
    console.log(error);
    throw new Error("Error writing PDF file");
  }
};

const generate = async (id: number) => {
  if (!_DATA) return;
  // list start position
  const ITEM_Y_Start = 545;
  const ITEM_X_Start = 60;

  // horizontal position
  const columnPosition = {
    index: ITEM_X_Start,
    description: ITEM_X_Start + 25,
    quantity: ITEM_X_Start + 359,
    unitPrice: ITEM_X_Start + 410,
    amount: ITEM_X_Start + 462,
  };

  const fontResolvePath = path.resolve("./public", "fonts/Sarabun-Regular.ttf");
  const fontPath = path.join(fontResolvePath);

  const templateResolvePath = path.resolve(
    "./public",
    "pdf/quotation-template.pdf"
  );

  const pdfTemplatePath = path.join(templateResolvePath);
  const [pdfDoc, fontData, existingPdfBytes] = await Promise.all([
    PDFDocument.create(),
    readFile(fontPath),
    readFile(pdfTemplatePath),
  ]);

  pdfDoc.registerFontkit(fontkit);
  _FONT = await pdfDoc.embedFont(fontData as any, { subset: true });
  const template = await PDFDocument.load(existingPdfBytes as any);
  const templatePage = await pdfDoc.embedPage(template.getPages()[0]);

  const config: ListConfig = {
    size: PAGE_FONT_SIZE,
    lineHeight: 11,
    font: _FONT,
  };

  const writeMainItem = (
    currentPage: PDFPage,
    index: number,
    data: QuotationList,
    lineStart: number
  ) => {
    // Description
    currentPage.drawText((index + 1).toString(), {
      x: columnPosition.index,
      y: lineStart,
      maxWidth: 20,
      ...config,
    });

    // // remark withholdingTax
    // if (
    //   data.withholdingTax
    // ) {
    //   currentPage.drawText("**", {
    //     x: columnPosition.description - 8,
    //     y: lineStart,
    //     maxWidth: 5,
    //     color: rgb(255 / 255, 0 / 255, 0 / 255),
    //     ...config,
    //     // lineHeight: breakLineHeight,
    //   });
    // }

    currentPage.drawText(data.name, {
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

    // Unit Price
    const unitPriceText = data.unitPrice
      ? data.unitPrice.toLocaleString("th-TH", CURRENCY_FORMAT)
      : "";
    currentPage.drawText(unitPriceText, {
      x: columnPosition.unitPrice + 44 - getTextWidth(unitPriceText, config),
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    // Amount
    let itemAmount = 0;
    if (data.unitPrice) {
      const quantity = data?.quantity || 1;
      itemAmount = data.unitPrice * quantity;
    }
    const amountText = itemAmount.toLocaleString("th-TH", CURRENCY_FORMAT);

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
    lineStart: number
  ) => {
    currentPage.drawText(description, {
      x: columnPosition.description + 12, // indent
      y: lineStart,
      maxWidth: 300,
      ...config,
      opacity: 0.5,
    });

    const bounding = getBoundingBox(
      description,
      pdfDoc,
      _FONT,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      300
    );

    return bounding.height / 10;
  };

  const writeSubItem = (
    currentPage: PDFPage,
    subItem: { label: string; quantity: string },
    lineStart: number
  ) => {
    // get current page number
    currentPage.drawText(subItem.label, {
      x: columnPosition.description + 12, // indent
      y: lineStart,
      maxWidth: 300,
      ...config,
      // lineHeight: breakLineHeight,
    });
    currentPage.drawText(subItem.quantity, {
      x: columnPosition.quantity, // indent
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    const bounding = getBoundingBox(
      subItem.label,
      pdfDoc,
      _FONT,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      300
    );

    return bounding.height / 10;
  };

  let page = pdfDoc.addPage();
  page.drawPage(templatePage);

  // drawSignature
  // approver
  // const approverSignatureImageBytes = await readFile(path.join(process.cwd(), "/public/signature/1.png"));
  const APPROVER_ID = 2
  const approver = await db.user.findFirst({
    where: {
      id: APPROVER_ID
    },
  });

  const approverSignature = await loadSignatureImage(APPROVER_ID.toString());
  const approverSignatureImage = await page.doc.embedPng(
    approverSignature.imageBytes as any
  );
  page.drawImage(approverSignatureImage, {
    x: 460,
    y: 70,
    ...approverSignatureImage.scale(0.1),
  });

  // phone
  const approverPhone = approver?.phone;
  page.drawText(approverPhone ?? "", {
    x: 460,
    y: 63,
    ...config,
  });
  page.drawText(_BILL_DATE, {
    x: 450,
    y: 45,
    ...config,
  });

  // seller
  const sellerId = _DATA.seller?.id;
  if (sellerId) {
    const sellerPhone = _DATA.seller?.phone;
    const sellerSignature = await loadSignatureImage(sellerId.toString());
    const sellerSignatureImage = await page.doc.embedPng(
      sellerSignature.imageBytes as any
    );
    page.drawImage(sellerSignatureImage, {
      x: 290,
      y: 70,
      ...approverSignatureImage.scale(0.1),
    });

    page.drawText(sellerPhone ?? "", {
      x: 290,
      y: 63,
      ...config,
    });

    page.drawText(_BILL_DATE, {
      x: 280,
      y: 45,
      ...config,
    });

  }

  drawStaticInfo(page, currentPageNumber);

  let lineStart = ITEM_Y_Start;

  _DATA.lists?.forEach((list, index) => {
    if (index > 0) {
      lineStart -= config.lineHeight; // space between main items
    }

    const mainItemRes = validatePageArea(
      page,
      pdfDoc,
      templatePage,
      lineStart,
      ITEM_Y_Start,
      (currentPage: PDFPage, currentLineStart: number) =>
        writeMainItem(currentPage, index, list, currentLineStart)
    );
    lineStart = mainItemRes.lineStart;
    page = mainItemRes.page;

    if (list.description) {
      const mainDescriptionRes = validatePageArea(
        page,
        pdfDoc,
        templatePage,
        lineStart,
        ITEM_Y_Start,
        (currentPage: PDFPage, currentLineStart: number) =>
          writeMainDescription(
            currentPage,
            list.description ?? "",
            currentLineStart
          )
      );

      lineStart = mainDescriptionRes.lineStart;
      page = mainDescriptionRes.page;
    }

    // write subItems
    const subItems = JSON.parse(list.subItems ?? "[{}]");
    if (subItems.length > 0) {
      subItems.forEach(
        (subItem: { label: string; quantity: string }, idx: number) => {
          const subItemRes = validatePageArea(
            page,
            pdfDoc,
            templatePage,
            lineStart,
            ITEM_Y_Start,
            (currentPage: PDFPage, currentLineStart: number) =>
              writeSubItem(currentPage, subItem, currentLineStart)
          );

          lineStart = subItemRes.lineStart;
          page = subItemRes.page;
        }
      );
    }
  });

  const modifiedPdfBytes = await pdfDoc.save();
  return {
    pdfBytes: modifiedPdfBytes,
  };
};

const drawHeaderInfo = (
  page: PDFPage,
  currentPageNumber: number,
  {
    code,
    date,
  }: {
    code: string;
    date: string;
  }
) => {
  if (!_FONT) return;
  const X_Start = 480;
  const Y_Start = 750;

  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };
  page.drawText(date, {
    x: X_Start,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });
  page.drawText(code, {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 100,
    ...config,
  });
  page.drawText(currentPageNumber.toString(), {
    x: X_Start,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });
};

const drawCustomerInfo = (page: PDFPage, contact: Contact) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 13,
  };

  const Y_Start = 670;
  const X_Start = 80;
  // name + branchId

  page.drawText(getCustomerNameWithBranch(contact.name, contact.branchId), {
    x: X_Start,
    y: Y_Start,
    maxWidth: 600,
    ...config,
  });

  page.drawText(contact.address ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 300,
    ...config,
  });

  page.drawText(contact.contact ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight * 3, // the third line
    maxWidth: 300,
    ...config,
  });

  page.drawText(contact.phone ?? "", {
    x: 440,
    y: Y_Start - config.lineHeight,
    maxWidth: 100,
    ...config,
  });

  page.drawText(contact.fax ?? "", {
    x: 440,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });

  page.drawText(contact.email ?? "", {
    x: 440,
    y: Y_Start - config.lineHeight * 3,
    maxWidth: 100,
    ...config,
  });
};

const drawOfferInfo = (
  page: PDFPage,
  {
    sellerName,
    paymentDue,
    deliveryPeriod,
    validPricePeriod,
  }: {
    sellerName: string;
    paymentDue: string;
    deliveryPeriod: string;
    validPricePeriod: string;
  }
) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  const Y_Start = 594;
  page.drawText(sellerName, {
    x: 65,
    y: Y_Start,
    maxWidth: 150,
    ...config,
  });

  // page.drawText(getPaymentCondition(paymentCondition), {
  //   x: 265,
  //   y: Y_Start,
  //   maxWidth: 150,
  //   ...config,
  // });

  page.drawText(paymentDue, {
    x: 260,
    y: Y_Start,
    maxWidth: 500,
    ...config,
  });
  page.drawText(deliveryPeriod, {
    x: 430,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });
  page.drawText(validPricePeriod, {
    x: 500,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });
};

const drawRemarkInfo = (page: PDFPage, text: string) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
    color: rgb(255 / 255, 0 / 255, 0 / 255),
  };

  page.drawText(text, {
    x: 60,
    y: 160,
    maxWidth: 350,
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
    lineHeight: 14,
  };

  const columnPosition = 520;

  page.drawText(totalPrice, {
    x: columnPosition + 46 - getTextWidth(totalPrice, config),
    y: 161,
    maxWidth: 100,
    ...config,
  });

  page.drawText(discount, {
    x: columnPosition + 46 - getTextWidth(discount, config),
    y: 148,
    maxWidth: 100,
    ...config,
  });

  page.drawText(tax, {
    x: columnPosition + 46 - getTextWidth(tax, config),
    y: 121,
    maxWidth: 100,
    ...config,
  });

  page.drawText(grandTotal, {
    x: columnPosition + 46 - getTextWidth(grandTotal, config),
    y: 106,
    maxWidth: 100,
    ...config,
  });
};

type ListConfig = {
  size: number;
  lineHeight: number;
  font: PDFFont;
};

const END_POSITION = 210;
let currentPageNumber = 1;
const validatePageArea = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  templatePage: PDFEmbeddedPage,
  lineStart: number,
  ITEM_Y_Start: number,
  exc: any
) => {
  if (!_DATA) return { page, lineStart };
  if (lineStart < END_POSITION) {
    currentPageNumber++;
    const newPage = pdfDoc.addPage();
    newPage.drawPage(templatePage);
    drawStaticInfo(newPage, currentPageNumber);

    lineStart = ITEM_Y_Start;

    let heightUsed = exc(newPage, lineStart);
    return {
      page: newPage,
      lineStart: lineStart - heightUsed,
    };
  }

  let heightUsed = exc(page, lineStart);
  return {
    page: page,
    lineStart: lineStart - heightUsed,
  };
};

const getTextWidth = (text: string, config: ListConfig) => {
  return config.font.widthOfTextAtSize(text, config.size);
};

const drawStaticInfo = (page: PDFPage, currentPageNumber: number) => {
  if (!_DATA) return;
  drawHeaderInfo(page, currentPageNumber, {
    code: _DATA.code,
    date: PDFDateFormat(new Date(_DATA.createdAt)),
  });
  drawCustomerInfo(page, _DATA.contact);
  drawOfferInfo(page, {
    sellerName: _DATA.seller?.name ?? "",
    paymentDue:
      _DATA.paymentType === "credit"
        ? "ไม่เกิน " + _DATA.paymentCondition + "วัน"
        : "เงินสด",
    deliveryPeriod: _DATA.deliveryPeriod
      ? _DATA.deliveryPeriod?.toString() + " วัน"
      : "",
    validPricePeriod: _DATA.validPricePeriod
      ? _DATA.validPricePeriod?.toString() + " วัน"
      : "",
    // paymentCondition: _DATA.paymentCondition ?? "",
  });
  drawRemarkInfo(page, _DATA.remark ?? "");

  const currencyFormat = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  drawPriceInfo(page, {
    discount: _DATA.discount?.toLocaleString("th-TH", currencyFormat) ?? "",
    tax: _DATA.tax?.toLocaleString("th-TH", currencyFormat) ?? "",
    totalPrice: _DATA.totalPrice?.toLocaleString("th-TH", currencyFormat) ?? "",
    grandTotal: _DATA.grandTotal?.toLocaleString("th-TH", currencyFormat) ?? "",
  });
  // drawSignature(page);
};
