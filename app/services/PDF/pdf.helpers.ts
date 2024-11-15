import {
  PDFDocument,
  PDFFont,
  breakTextIntoLines,
} from "pdf-lib";


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