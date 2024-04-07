import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { QuotationList } from "@prisma/client";
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  breakTextIntoLines,
} from "pdf-lib";
import fs from "fs/promises"; // Node.js file system module with promises
import fontkit from "@pdf-lib/fontkit";

const PAGE_FONT_SIZE = 8;

export const loadQuotation = async (id?: number) => {
  try {
    const quotationLists = await db.quotationList.findMany({
      where: {
        quotationId: 6,
      },
    });

    const { pdfDoc, font } = await initTemplate();

    const page = pdfDoc.getPage(0); // First page
    drawHeaderInfo(page, font);
    drawCustomerInfo(page, font);
    drawOfferInfo(page, font);
    drawLists(pdfDoc, quotationLists, page, font);
    drawRemarkInfo(page, font);

    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfPath = `public/result-${id}.pdf`; // Path to save modified PDF
    await fs.writeFile(modifiedPdfPath, modifiedPdfBytes);
    return {
      pdfPath: modifiedPdfPath,
    };
  } catch (error) {
    throw new Error("Error writing PDF file");
  }
};

const initTemplate = async () => {
  // Assuming fs.promises is used for readFile to return a Promise.
  const [existingPdfBytes, fontData] = await Promise.all([
    fs.readFile("app/services/PDF/quotation/quotation-template.pdf"),
    fs.readFile("assets/Sarabun-Regular.ttf"),
  ]);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  // This can only be done after pdfDoc is loaded, so it's not part of the initial Promise.all
  const myFont = await pdfDoc.embedFont(fontData, { subset: true });

  return { pdfDoc, font: myFont };
};

const drawLists = (
  pdfDoc: PDFDocument,
  quotationDataLists: QuotationList[],
  page: PDFPage,
  font: PDFFont
) => {
  const ITEM_Y_Start = 545;
  const ITEM_X_Start = 60;

  const columnPosition = {
    index: ITEM_X_Start,
    description: ITEM_X_Start + 20,
    quantity: ITEM_X_Start + 355,
    unitPrice: ITEM_X_Start + 410,
    amount: ITEM_X_Start + 458,
  };

  const config = {
    font,
    size: PAGE_FONT_SIZE,
    lineHeight: 11,
  };

  const breakLineHeight = 11;

  const writeMainItem = (
    index: number,
    data: QuotationList,
    lineStart: number
  ) => {
    // Description
    page.drawText((index + 1).toString(), {
      x: columnPosition.index,
      y: lineStart,
      maxWidth: 20,
      ...config,
    });
    page.drawText(data.name, {
      x: columnPosition.description,
      y: lineStart,
      maxWidth: 600,
      ...config,
      // lineHeight: breakLineHeight,
    });

    // Quantity
    page.drawText(data.quantity ? data.quantity.toString() : "", {
      x: columnPosition.quantity,
      y: lineStart,
      maxWidth: 20,
      ...config,
    });

    // Unit Price
    page.drawText(data.unitPrice ? data.unitPrice.toLocaleString() : "", {
      x: columnPosition.unitPrice,
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    // Amount
    page.drawText(data.totalPrice ? data.totalPrice.toLocaleString() : "", {
      x: columnPosition.amount,
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    const bounding = getBoundingBox(
      data.name,
      pdfDoc,
      font,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      600
    );

    return bounding.height / 10;
  };

  const writeMainDescription = (description: string, lineStart: number) => {
    page.drawText(description, {
      x: columnPosition.description + 12, // indent
      y: lineStart,
      maxWidth: 300,
      ...config,
      opacity: 0.5,
      // lineHeight: breakLineHeight,
    });

    const bounding = getBoundingBox(
      description,
      pdfDoc,
      font,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      300
    );

    return bounding.height / 10;
  };
  const writeSubItem = (
    subItem: { label: string; quantity: string },
    lineStart: number
  ) => {
    page.drawText(subItem.label, {
      x: columnPosition.description + 12, // indent
      y: lineStart,
      maxWidth: 300,
      ...config,
      // lineHeight: breakLineHeight,
    });
    page.drawText(subItem.quantity, {
      x: columnPosition.quantity, // indent
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    const bounding = getBoundingBox(
      subItem.label,
      pdfDoc,
      font,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      300
    );

    return bounding.height / 10;
  };

  let lineStart = ITEM_Y_Start;

  quotationDataLists.forEach((list, index) => {
    if (index > 0) {
      lineStart -= config.lineHeight; // space between main items
    }
    let heightUsed = writeMainItem(index, list, lineStart);
    console.log("main item height", heightUsed);
    lineStart -= heightUsed; //config.lineHeight;

    if (list.description) {
      heightUsed = writeMainDescription(list.description, lineStart);
      console.log("desc item height", heightUsed);

      lineStart -= heightUsed;
    }

    // write subItems
    const subItems = JSON.parse(list.subItems ?? "[{}]");
    if (subItems.length > 0) {
      subItems.forEach(
        (subItem: { label: string; quantity: string }, idx: number) => {
          heightUsed = writeSubItem(subItem, lineStart);
          console.log("sub item height", heightUsed);

          lineStart -= heightUsed;
        }
      );
    }
  });

  // console.log(quotationItems);
};

const drawHeaderInfo = (page: PDFPage, font: PDFFont) => {
  const quotation = {
    code: "QT-2021-0001",
    date: "2021-01-01",
    page: "1",
  };
  const X_Start = 480;
  const Y_Start = 750;

  const config = {
    font,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };
  page.drawText(quotation.date, {
    x: X_Start,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });
  page.drawText(quotation.code, {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 100,
    ...config,
  });
  page.drawText(quotation.page, {
    x: X_Start,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });
};

const drawCustomerInfo = (page: PDFPage, font: PDFFont) => {
  const customer = {
    id: 1,
    name: "Chanwanich Security Printing Company Limite",
    address:
      "อาคารกองบุญมา 699 ถนนสีลม แขวงสีลมเขตบางรัก กรุงเทพฯ 10500 เลขที่ภาษี105533079571",
    phone: "111-555-5555",
    contact: "Mr. Chanwanich Security Printing Company Limite",
  };

  // const { width, height } = page.getSize();

  const config = {
    font,
    size: PAGE_FONT_SIZE,
    lineHeight: 13,
  };

  const Y_Start = 670;
  const X_Start = 80;
  page.drawText(customer.name, {
    x: X_Start,
    y: Y_Start,
    maxWidth: 600,
    ...config,
  });

  page.drawText(customer.address, {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 300,
    ...config,
  });

  page.drawText(customer.contact, {
    x: X_Start,
    y: Y_Start - config.lineHeight * 3, // the third line
    maxWidth: 300,
    ...config,
  });

  page.drawText(customer.phone, {
    x: 440,
    y: 657,
    maxWidth: 100,
    ...config,
  });
};

const drawOfferInfo = (page: PDFPage, font: PDFFont) => {
  const offerer = {
    name: "จันทินี นาวีว่อง",
    paymentDue: "15 วัน",
    deliveryPeriod: "60 วัน",
    validPricePeriod: "15 วัน",
  };

  const config = {
    font,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  page.drawText(offerer.name, {
    x: 65,
    y: 594,
    maxWidth: 150,
    ...config,
  });
  page.drawText(offerer.paymentDue, {
    x: 260,
    y: 594,
    maxWidth: 500,
    ...config,
  });
  page.drawText(offerer.deliveryPeriod, {
    x: 430,
    y: 594,
    maxWidth: 100,
    ...config,
  });
  page.drawText(offerer.validPricePeriod, {
    x: 500,
    y: 594,
    maxWidth: 100,
    ...config,
  });
};

const drawRemarkInfo = (page: PDFPage, font: PDFFont) => {
  const config = {
    font,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
    color: rgb(255 / 255, 0 / 255, 0 / 255),
  };

  page.drawText(
    "Exclude : Rollout Client *** Warranty 30 day after install: Rollout Client",
    {
      x: 60,
      y: 160,
      maxWidth: 350,
      ...config,
    }
  );
};

function getBoundingBox(
  text: string,
  doc: PDFDocument,
  font: PDFFont,
  fontSize: number,
  lineHeight: number,
  maxWidth: number
) {
  // Function to measure the width of a length of text. Lifted from the 'drawText' source.
  // font refers to an instance of PDFFont
  const measureWidth = (s: any) => font.widthOfTextAtSize(s, fontSize);

  // We split the text into an array of lines
  // doc refers to an instance of PDFDocument
  const lines = breakTextIntoLines(
    text,
    doc.defaultWordBreaks,
    maxWidth,
    measureWidth
  );

  // We get the index of the longest line
  const longestLine = lines.reduce(
    (prev, val, idx) => (val.length > lines[prev].length ? idx : prev),
    0
  );
  // The width of our bounding box will be the width of the longest line of text
  const textWidth = measureWidth(lines[longestLine]);
  // The height of our bounding box will be the number of lines * the font size * line height
  const textHeight = lines.length * fontSize * lineHeight;

  // Note: In my code I express the line height like in CSS (e.g. 1.15), if you express your line height in
  // a PDF-LIB compatible way, you'd do it like this:
  //const textHeight = lines.length * fontSize * (lineHeight / fontSize);

  return { width: textWidth, height: textHeight };
}
