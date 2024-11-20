import { db } from "@/lib/db";
import {
  Contact,
  Quotation,
  QuotationList,
  User,
} from "@prisma/client";
import { PDFDocument, PDFFont, PDFPage, rgb, PDFEmbeddedPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getBoundingBox, PDFDateFormat } from "./pdf.helpers";
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
let _BILL_DATE = ""

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

export const generateInvoice = async (id: number, date: string) => {
  try {
    if (!id) {
      throw new Error("Invalid quotation ID");
    }

    _BILL_DATE = PDFDateFormat(new Date(date))


    const quotation = await getQuotation(id);

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    let temporaryQuotationTotalPrice = {};
    // check if total price is not yet calculated
    if (!quotation.grandTotal) {
      // const quotationListsByVendor = groupQuotationByVendor(
      //   quotation.lists as QuotationListWithRelations[]
      // );

      // const { sumTotalPrice, sumDiscount, sumTotalTax, grandTotal } =
      //   summarizeQuotationTotalPrice(quotationListsByVendor);

      const { totalPrice, discount, tax, grandTotal } =
        calculateQuotationItemPrice(quotation.lists);

      temporaryQuotationTotalPrice = {
        totalPrice,
        discount,
        tax,
        grandTotal,
      };
    }

    return generate(id, { ...quotation, ...temporaryQuotationTotalPrice });
  } catch (error) {
    console.log(error);
    throw new Error("Error writing PDF file");
  }
};

const generate = async (id: number, data: QuotationWithRelations) => {
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

  const basePath = process.cwd(); // Gets the base path of your project
  const fontPath = path.join(basePath, "public/fonts/Sarabun-Regular.ttf");
  const pdfTemplatePath = path.join(
    basePath,
    "public/pdf/quotation-template.pdf"
  );
  const [pdfDoc, fontData, existingPdfBytes] = await Promise.all([
    PDFDocument.create(),
    readFile(fontPath),
    readFile(pdfTemplatePath),
  ]);

  pdfDoc.registerFontkit(fontkit);
  const myFont = await pdfDoc.embedFont(fontData, { subset: true });
  const template = await PDFDocument.load(existingPdfBytes);
  const templatePage = await pdfDoc.embedPage(template.getPages()[0]);

  const config: ListConfig = {
    size: PAGE_FONT_SIZE,
    lineHeight: 11,
    font: myFont,
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
      maxWidth: 600,
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
      itemAmount = data.unitPrice * quantity
    }
    const amountText = itemAmount.toLocaleString("th-TH", CURRENCY_FORMAT)

    currentPage.drawText(amountText, {
      x: columnPosition.amount + 44 - getTextWidth(amountText, config),
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    const bounding = getBoundingBox(
      data.name,
      pdfDoc,
      myFont,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      600
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
      myFont,
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
    console.log();
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
      myFont,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      300
    );

    return bounding.height / 10;
  };

  let page = pdfDoc.addPage();
  page.drawPage(templatePage);

  drawStaticInfo(page, myFont, 1, data);

  let lineStart = ITEM_Y_Start;

  data.lists?.forEach((list, index) => {
    if (index > 0) {
      lineStart -= config.lineHeight; // space between main items
    }

    const mainItemRes = validatePageArea(
      page,
      pdfDoc,
      templatePage,
      myFont,
      lineStart,
      ITEM_Y_Start,
      data,
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
        myFont,
        lineStart,
        ITEM_Y_Start,
        data,
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
            myFont,
            lineStart,
            ITEM_Y_Start,
            data,
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
  // const modifiedPdfPath = `public/quotation.pdf`; // Path to save modified PDF
  // await fs.writeFile(modifiedPdfPath, modifiedPdfBytes);
  return {
    // pdfPath: modifiedPdfPath,
    pdfBytes: modifiedPdfBytes,
  };
};

const drawHeaderInfo = (
  page: PDFPage,
  font: PDFFont,
  currentPageNumber: number,
  {
    code,
    date,
  }: {
    code: string;
    date: string;
  }
) => {
  const X_Start = 480;
  const Y_Start = 750;

  const config = {
    font,
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

const drawCustomerInfo = (page: PDFPage, font: PDFFont, contact: Contact) => {
  const config = {
    font,
    size: PAGE_FONT_SIZE,
    lineHeight: 13,
  };

  const Y_Start = 670;
  const X_Start = 80;
  page.drawText(contact.name, {
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
    y: 657,
    maxWidth: 100,
    ...config,
  });
};

const drawOfferInfo = (
  page: PDFPage,
  font: PDFFont,
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
  const config = {
    font,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  page.drawText(sellerName, {
    x: 65,
    y: 594,
    maxWidth: 150,
    ...config,
  });
  page.drawText(paymentDue, {
    x: 260,
    y: 594,
    maxWidth: 500,
    ...config,
  });
  page.drawText(deliveryPeriod, {
    x: 430,
    y: 594,
    maxWidth: 100,
    ...config,
  });
  page.drawText(validPricePeriod, {
    x: 500,
    y: 594,
    maxWidth: 100,
    ...config,
  });
};

const drawRemarkInfo = (page: PDFPage, font: PDFFont, text: string) => {
  const config = {
    font,
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
  font: PDFFont,
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
  const config = {
    font,
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
  myFont: PDFFont,
  lineStart: number,
  ITEM_Y_Start: number,
  data: QuotationWithRelations,
  exc: any
) => {
  if (lineStart < END_POSITION) {
    currentPageNumber++;
    const newPage = pdfDoc.addPage();
    newPage.drawPage(templatePage);
    drawStaticInfo(newPage, myFont, currentPageNumber, data);

    lineStart = ITEM_Y_Start;

    let heightUsed = exc(newPage, lineStart);
    return {
      page: newPage,
      lineStart: lineStart - heightUsed,
    };
    // return lineStart
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

const drawStaticInfo = (
  page: PDFPage,
  font: PDFFont,
  currentPageNumber: number,
  data: QuotationWithRelations
) => {
  drawHeaderInfo(page, font, currentPageNumber, {
    code: data.code,
    date: PDFDateFormat(new Date(_BILL_DATE)),
  });
  drawCustomerInfo(page, font, data.contact);
  drawOfferInfo(page, font, {
    sellerName: data.seller?.name ?? "",
    paymentDue: data.paymentDue
      ? "ไม่เกิน " + getDateFormat(data.paymentDue)
      : "",
    deliveryPeriod: data.deliveryPeriod?.toString() ?? "",
    validPricePeriod: data.validPricePeriod?.toString() ?? "",
  });
  drawRemarkInfo(page, font, data.remark ?? "");

  const currencyFormat = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  drawPriceInfo(page, font, {
    discount: data.discount?.toLocaleString("th-TH", currencyFormat) ?? "",
    tax: data.tax?.toLocaleString("th-TH", currencyFormat) ?? "",
    totalPrice: data.totalPrice?.toLocaleString("th-TH", currencyFormat) ?? "",
    grandTotal: data.grandTotal?.toLocaleString("th-TH", currencyFormat) ?? "",
  });
};
