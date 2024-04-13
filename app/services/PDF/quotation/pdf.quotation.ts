import { db } from "@/lib/db";
import { Contact, Quotation, QuotationList, User } from "@prisma/client";
import { PDFDocument, PDFFont, PDFPage, rgb, PDFEmbeddedPage } from "pdf-lib";
import fs from "fs/promises"; // Node.js file system module with promises
import fontkit from "@pdf-lib/fontkit";
import { getBoundingBox } from "../pdf.helpers";
import { getDateFormat } from "@/lib/utils";
import path from 'path';
import { readFile } from 'fs/promises';

const PAGE_FONT_SIZE = 8;

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
      lists: true,
      seller: true,
      contact: true,
    },
    where: {
      id: parseInt(id.toString()),
    },
  });

  return quotation;
};

export const generateInvoice = async (id: number) => {
  try {
    if (!id) {
      throw new Error("Invalid quotation ID");
    }

    const quotation = await getQuotation(id);

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    return generate(id, quotation);
  } catch (error) {
    console.log(error);
    throw new Error("Error writing PDF file");
  }
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
    grandTotal
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
    x: columnPosition + 44 - getTextWidth(totalPrice, config),
    y: 163,
    maxWidth: 100,
    ...config,
  });

  page.drawText(discount, {
    x: columnPosition + 44 - getTextWidth(discount, config),
    y: 150,
    maxWidth: 100,
    ...config,
  });

  page.drawText(tax, {
    x: columnPosition + 44 - getTextWidth(tax, config),
    y: 123,
    maxWidth: 100,
    ...config,
  });

 
  page.drawText(grandTotal, {
    x: columnPosition + 44 - getTextWidth(grandTotal, config),
    y: 108,
    maxWidth: 100,
    ...config,
  });
};

type ListConfig = {
  size: number;
  lineHeight: number;
  font: PDFFont;
};

const generate = async (id: number, data: QuotationWithRelations) => {
  // list start position
  const ITEM_Y_Start = 545;
  const ITEM_X_Start = 60;

  // horizontal position
  const columnPosition = {
    index: ITEM_X_Start,
    description: ITEM_X_Start + 20,
    quantity: ITEM_X_Start + 355,
    unitPrice: ITEM_X_Start + 408,
    amount: ITEM_X_Start + 460,
  };

  const basePath = process.cwd(); // Gets the base path of your project
  const fontPath = path.join(basePath, 'public/fonts/Sarabun-Regular.ttf');
  const pdfTemplatePath = path.join(basePath, 'public/pdf/quotation-template.pdf');
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

    // page.drawRectangle({
    //   x: columnPosition.unitPrice,
    //   y: lineStart,
    //   width: 44,
    //   height: 10,
    //   borderColor: rgb(1, 0, 0),
    // });

    // Unit Price
    const unitPriceText = data.unitPrice ? data.unitPrice.toLocaleString() : "";
    currentPage.drawText(unitPriceText, {
      x: columnPosition.unitPrice + 44 - getTextWidth(unitPriceText, config),
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    // Amount
    const amountText = data.totalPrice ? data.totalPrice.toLocaleString() : "";
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
  const modifiedPdfPath = `public/result-${id}.pdf`; // Path to save modified PDF
  await fs.writeFile(modifiedPdfPath, modifiedPdfBytes);
  return {
    pdfPath: modifiedPdfPath,
  };
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
    date: data.createdAt.toDateString(),
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
  drawPriceInfo(page, font, {
    discount: data.discount?.toLocaleString() ?? "",
    tax: data.tax?.toLocaleString() ?? "",
    totalPrice: data.totalPrice?.toLocaleString() ?? "",
    grandTotal: data.grandTotal?.toLocaleString() ?? "",
  });
};
