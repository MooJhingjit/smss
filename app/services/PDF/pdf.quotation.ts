import { db } from "@/lib/db";
import { Contact, Quotation, QuotationList, User } from "@prisma/client";
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  PDFEmbeddedPage,
  degrees,
  PDFImage,
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
        orderBy: {
          id: 'asc'
        }
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

  // Track the current page number as a reference object so it can be updated from validatePageArea
  const pageNumberRef = { currentPageNumber: 1 };

  // horizontal position
  const columnPosition = {
    index: ITEM_X_Start,
    description: ITEM_X_Start + 25,
    quantity: ITEM_X_Start + 359,
    unitPrice: ITEM_X_Start + 410,
    amount: ITEM_X_Start + 462,
  };

  const fontResolvePath = path.resolve("./public", "fonts/Sarabun-Regular.ttf"); // sarabun-new
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

    // Unit
    const unitText = data.unit ? data.unit : "";
    const unitTextWidth = getTextWidth(unitText, config);
    const unitTextX = columnPosition.quantity + 34 - unitTextWidth / 2; // Center align
    currentPage.drawText(unitText, {
      x: unitTextX,
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    // Unit Price
    const unitPriceText = data.unitPrice
      ? data.unitPrice.toLocaleString("th-TH", CURRENCY_FORMAT)
      : "0.00";
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

  // Load signature images once at the beginning - this is more efficient
  const APPROVER_ID = 2
  const approver = await db.user.findFirst({
    where: {
      id: APPROVER_ID
    },
  });

  const approverSignature = await loadSignatureImage(APPROVER_ID.toString());
  const approverSignatureImage = await pdfDoc.embedPng(
    approverSignature.imageBytes as any
  );

  // Load seller signature if available
  const sellerId = _DATA.seller?.id;
  let sellerSignatureImage = null;
  if (sellerId) {
    const sellerSignature = await loadSignatureImage(sellerId.toString());
    sellerSignatureImage = await pdfDoc.embedPng(
      sellerSignature.imageBytes as any
    );
  }

  // Store these values to be used in drawSignature function
  const signatureData = {
    approverSignatureImage,
    approverPhone: approver?.phone ?? "",
    sellerSignatureImage,
    sellerPhone: _DATA.seller?.phone ?? ""
  };

  // Draw signatures on the first page
  drawSignature(page, signatureData);

  drawStaticInfo(page, pageNumberRef.currentPageNumber);

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
        writeMainItem(currentPage, index, list, currentLineStart),
      pageNumberRef,
      signatureData
    );
    lineStart = mainItemRes.lineStart;
    page = mainItemRes.page;

    if (list.description) {

      const descriptionLines = list.description.split("\n");

      descriptionLines.forEach((descriptionLine, idx) => {

        const text = typeof descriptionLine === "string" ? descriptionLine : " ";

        const mainDescriptionRes = validatePageArea(
          page,
          pdfDoc,
          templatePage,
          lineStart,
          ITEM_Y_Start,
          (currentPage: PDFPage, currentLineStart: number) =>
            writeMainDescription(
              currentPage,
              text || " ",
              currentLineStart
            ),
          pageNumberRef,
          signatureData
        );

        lineStart = mainDescriptionRes.lineStart;
        page = mainDescriptionRes.page;
      });

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
              writeSubItem(currentPage, subItem, currentLineStart),
            pageNumberRef,
            signatureData
          );

          lineStart = subItemRes.lineStart;
          page = subItemRes.page;
        }
      );
    }
  });


  // show price on the last page
  const currencyFormat = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  // total = sub total - discount

  const total = _DATA.totalPrice
    ? _DATA.totalPrice - (_DATA.discount ?? 0)
    : 0;  
  drawPriceInfo(page, {
    discount: _DATA.discount?.toLocaleString("th-TH", currencyFormat) ?? "",
    tax: _DATA.tax?.toLocaleString("th-TH", currencyFormat) ?? "",
    totalPrice: _DATA.totalPrice?.toLocaleString("th-TH", currencyFormat) ?? "", // sub total
    total: total.toLocaleString("th-TH", currencyFormat) ?? "",
    grandTotal: _DATA.grandTotal?.toLocaleString("th-TH", currencyFormat) ?? "",
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
    totalPrice, // sub total
    total,
    discount,
    tax,
    grandTotal,
  }: {
    totalPrice: string; // sub total
    total: string;
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

  page.drawText(total, {
    x: columnPosition + 46 - getTextWidth(total, config),
    y: 133,
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

// Define a type for signature data to pass around
type SignatureData = {
  approverSignatureImage: PDFImage;
  approverPhone: string;
  sellerSignatureImage: PDFImage | null;
  sellerPhone: string;
};

const drawSignature = (page: PDFPage, signatureData: SignatureData) => {
  if (!_FONT) return;

  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE - 1,
    lineHeight: 14,
  };

  // Draw approver signature
  page.drawImage(signatureData.approverSignatureImage, {
    x: 460,
    y: 70,
    ...signatureData.approverSignatureImage.scale(0.12),
  });

  // Approver phone
  page.drawText(signatureData.approverPhone, {
    x: 460,
    y: 62,
    ...config,
  });

  // Approver date
  page.drawText(_BILL_DATE, {
    x: 450,
    y: 45,
    ...config,
    size: PAGE_FONT_SIZE,
  });

  // Draw seller signature if available
  if (signatureData.sellerSignatureImage) {
    page.drawImage(signatureData.sellerSignatureImage, {
      x: 290,
      y: 70,
      ...signatureData.approverSignatureImage.scale(0.12),
    });

    // Seller phone
    page.drawText(signatureData.sellerPhone, {
      x: 290,
      y: 62,
      ...config,
    });

    // Seller date
    page.drawText(_BILL_DATE, {
      x: 280,
      y: 45,
      ...config,
      size: PAGE_FONT_SIZE,
    });
  }
};

type ListConfig = {
  size: number;
  lineHeight: number;
  font: PDFFont;
};

const END_POSITION = 210;

const validatePageArea = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  templatePage: PDFEmbeddedPage,
  lineStart: number,
  ITEM_Y_Start: number,
  exc: any,
  pageNumberRef: { currentPageNumber: number },
  signatureData: SignatureData
) => {
  if (!_DATA) return { page, lineStart };
  if (lineStart < END_POSITION) {
    pageNumberRef.currentPageNumber++;
    const newPage = pdfDoc.addPage();
    newPage.drawPage(templatePage);
    drawStaticInfo(newPage, pageNumberRef.currentPageNumber);
    // Draw signatures on each new page
    drawSignature(newPage, signatureData);

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

  // const currencyFormat = {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // };
  // drawPriceInfo(page, {
  //   discount: _DATA.discount?.toLocaleString("th-TH", currencyFormat) ?? "",
  //   tax: _DATA.tax?.toLocaleString("th-TH", currencyFormat) ?? "",
  //   totalPrice: _DATA.totalPrice?.toLocaleString("th-TH", currencyFormat) ?? "",
  //   grandTotal: _DATA.grandTotal?.toLocaleString("th-TH", currencyFormat) ?? "",
  // });
  // drawSignature(page);
};
