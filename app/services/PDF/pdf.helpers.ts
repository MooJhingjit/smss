import {
  PDFDocument,
  PDFFont,
  PDFPage,
  breakTextIntoLines,
  PDFEmbeddedPage
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import path from "path";
import { readFile } from "fs/promises";

export type ListConfig = {
  size: number;
  lineHeight: number;
  font: PDFFont;
};

export function PDFDateFormat(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getBoundingBox(
  text: string,
  doc: PDFDocument,
  font: PDFFont | null,
  fontSize: number,
  lineHeight: number,
  maxWidth: number
) {

  // Function to measure the width of a length of text. Lifted from the 'drawText' source.
  // font refers to an instance of PDFFont
  const measureWidth = (s: any) => font?.widthOfTextAtSize(s, fontSize) || 0;

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

export async function loadSignatureImage(page: PDFPage, userKey: string) {
  const userConfig = {
    "a": {
      path: "/public/signature/a.png",
      width: 120,
      height: 40,
    },
    "b": {
      path: "/public/signature/b.png",
      width: 60,
      height: 40,
    }
  }
  const signatureImageBytes = await readFile(path.join(process.cwd(), userConfig[userKey as keyof typeof userConfig].path));
  const signatureImage = await page.doc.embedPng(signatureImageBytes as any);

  return {
    signatureImage,
    width: userConfig[userKey as keyof typeof userConfig].width,
    height: userConfig[userKey as keyof typeof userConfig].height,
  };
}

export async function loadPdfAssets(publicPath: string) {
  const basePath = process.cwd(); // Gets the base path of your project
  const fontPath = path.join(basePath, "public/fonts/Sarabun-Regular.ttf");
  const pdfTemplatePath = path.join(basePath, publicPath);

  const [pdfDoc, fontData, existingPdfBytes] = await Promise.all([
    PDFDocument.create(),
    readFile(fontPath),
    readFile(pdfTemplatePath),
  ]);

  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontData as any, { subset: true });
  const template = await PDFDocument.load(existingPdfBytes as any);

  return { pdfDoc, font, template };
}

export const validatePageArea = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  templatePage: PDFEmbeddedPage,
  lineStart: number,
  LIST_END_AT: number,
  ITEM_Y_Start: number,
  exc: any
) => {
  if (lineStart < LIST_END_AT) {
    const newPage = pdfDoc.addPage();
    newPage.drawPage(templatePage);
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

export const getTextWidth = (text: string, config: ListConfig) => {
  return config.font.widthOfTextAtSize(text, config.size);
};

export const getPaymentCondition = (condition: string | undefined): string => {
  if (!condition) return "";
  if (!isNaN(parseInt(condition))) {
    return condition + " วัน";
  } else if (condition === "cash") {
    return "เงินสด";
  }
  return "";
};


export const getBillDueDate = (date: Date, condition: string | undefined): Date => {
  // If condition is not set, return the original date
  if (!condition) return date;

  // If condition is a number, add the number of days to the original date
  if (!isNaN(parseInt(condition))) {
    return new Date(date.getTime() + parseInt(condition) * 24 * 60 * 60 * 1000);
  }
  return date;
}