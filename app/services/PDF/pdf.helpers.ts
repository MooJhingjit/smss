import {
  PDFDocument,
  PDFFont,
  PDFPage,
  breakTextIntoLines,
  PDFEmbeddedPage,
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
  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
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

// export async function loadSignatureImage(page: PDFPage, userKey: string) {
//   const userConfig = {
//     "1": {
//       path: "/public/signature/1.png",
//       width: 120,
//       height: 40,
//     },
//     "2": {
//       path: "/public/signature/2.png",
//       width: 60,
//       height: 40,
//     }
//   }
//   const signatureImageBytes = await readFile(path.join(process.cwd(), userConfig[userKey as keyof typeof userConfig].path));
//   const signatureImage = await page.doc.embedPng(signatureImageBytes as any);

//   return {
//     signatureImage,
//     width: userConfig[userKey as keyof typeof userConfig].width,
//     height: userConfig[userKey as keyof typeof userConfig].height,
//   };
// }

export async function loadSignatureImage(userKey: string) {
  const userConfig = {
    "1": {
      path: "signature/1.png",
      scale: 0.7,
    },
    "2": {
      path: "signature/2.png",
      scale:0.2,
    },
    "3": {
      path: "signature/3.png",
      scale: 0.1,
    },
    "4": {
      path: "signature/4.png",
      scale: 0.1,
    },
  };

  const user = userConfig[userKey as keyof typeof userConfig];
  const userPath = user ? user.path : "signature/blank.png";

  const folderPath = path.resolve("./public", userPath);

  const imageBytes = await readFile(path.join(folderPath));

  return {
    imageBytes,
    scale: userConfig[userKey as keyof typeof userConfig].scale,
  };
}

export async function loadPdfAssets(publicPath: string) {
  // const basePath = process.cwd(); // Gets the base path of your project
  const fontResolvePath = path.resolve("./public", "fonts/Sarabun-Regular.ttf");
  const fontPath = path.join(fontResolvePath);

  const templateResolvePath = path.resolve("./public", publicPath);
  const pdfTemplatePath = path.join(templateResolvePath);

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

export const getBillDueDate = (
  date: Date,
  condition: string | undefined
): Date => {
  // If condition is not set, return the original date
  if (!condition) return date;

  // If condition is a number, add the number of days to the original date
  if (!isNaN(parseInt(condition))) {
    return new Date(date.getTime() + parseInt(condition) * 24 * 60 * 60 * 1000);
  }
  return date;
};

// numeric prices into Thai characters
const thaiNumberWords = {
  0: "ศูนย์",
  1: "หนึ่ง",
  2: "สอง",
  3: "สาม",
  4: "สี่",
  5: "ห้า",
  6: "หก",
  7: "เจ็ด",
  8: "แปด",
  9: "เก้า",
};

const thaiPlaceValues = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

export const convertToThaiBahtText = (price: number): string => {
  const [baht, satang] = price.toFixed(2).split(".");

  const convertIntegerToThai = (num: string): string => {
    let result = "";
    const length = num.length;

    const processSegment = (segment: string): string => {
      let segmentResult = "";
      const segmentLength = segment.length;
      for (let i = 0; i < segmentLength; i++) {
        const digit = parseInt(segment[i]);
        const placeValueIndex = segmentLength - i - 1;

        if (digit === 0) continue;

        if (digit === 1 && placeValueIndex === 1) {
          segmentResult += "สิบ";
        } else if (digit === 2 && placeValueIndex === 1) {
          segmentResult += "ยี่สิบ";
        } else if (digit === 1 && placeValueIndex === 0 && segmentLength > 1) {
          segmentResult += "เอ็ด";
        } else {
          segmentResult +=
            thaiNumberWords[digit as keyof typeof thaiNumberWords] +
            thaiPlaceValues[placeValueIndex];
        }
      }
      return segmentResult;
    };

    const groups = Math.ceil(length / 6); // Each group is at most 6 digits long (e.g., "ล้าน")
    for (let groupIndex = 0; groupIndex < groups; groupIndex++) {
      const start = length - (groupIndex + 1) * 6;
      const end = length - groupIndex * 6;
      const segment = num.slice(Math.max(0, start), end);

      if (parseInt(segment) > 0) {
        const groupText = processSegment(segment);
        if (groupIndex > 0) result = groupText + thaiPlaceValues[6] + result;
        else result = groupText + result;
      }
    }

    return result;
  };

  const bahtText = convertIntegerToThai(baht) + "บาท";
  const satangText =
    parseInt(satang) > 0 ? convertIntegerToThai(satang) + "สตางค์" : "ถ้วน";

  return bahtText + satangText;
};
