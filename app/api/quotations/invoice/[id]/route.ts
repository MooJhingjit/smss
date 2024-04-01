import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { QuotationStatus } from "@prisma/client";
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs/promises'; // Node.js file system module with promises
import path from 'path';

// PUT /api/quotations/invoice/:id
export async function POST(
  req: NextRequest,
  context: { params: { id: number } },
) {

  const { id } = context.params;
  try {

    const existingPdfPath = "app/api/quotations/invoice/qt-template.pdf";
    const existingPdfBytes = await fs.readFile(existingPdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPage(0); // Get the first page
    // const helveticaFont = await pdfDoc.embedFont(PDFDocument.Font.Helvetica);
    page.drawText('Hello, World!', {
      x: 50,
      y: 50,
      size: 24,
      // font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    const modifiedPdfBytes = await pdfDoc.save();

    const modifiedPdfPath = `app/(platform)/(directory)/quotations/invoices/result-${id}.pdf`; // Path to save modified PDF
    await fs.writeFile(modifiedPdfPath, modifiedPdfBytes);

    // return new NextResponse("Success", { status: 200 });

    const successResult = {
      message: "Success",
      pdfPath: modifiedPdfPath,
    };
    return NextResponse.json(successResult);

    // return NextResponse.json();
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
