import { generateBillCover } from "@/app/services/PDF/pdf.product-bill-cover";
import { generateInvoice as generateBilToCustomer } from "@/app/services/PDF/pdf.product-bill-to-customer";
import { db } from "@/lib/db";
import { generateInvoiceCode } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";

export async function generateGroupInvoices(id: string, customDate: string) {
  const billGroupId = parseInt(id);
  // Get quotations from quotationGroupId
  const quotations = await db.quotation.findMany({
    select: {
      id: true,
      grandTotal: true,
    },
    where: {
      billGroupId,
    }
  });

  // Create a new PDF document to combine all PDFs
  const mergedPdf = await PDFDocument.create();



  for (const quotation of quotations) {

    await validateQuotationInvoice(quotation, billGroupId, customDate);

    const result = await generateBilToCustomer(quotation.id, customDate);
    if (!result) {
      throw new Error(`Failed to generate PDF for quotation id: ${quotation.id}`);
    }
    const { pdfBytes } = result;

    // Load the generated PDF and copy its pages to the merged PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  // Generate PDF for each quotation
  const billCover = await generateBillCover(8, customDate);
  if (billCover) {
    const billCoverDoc = await PDFDocument.load(billCover.pdfBytes);
    const billCoverPages = await mergedPdf.copyPages(billCoverDoc, billCoverDoc.getPageIndices());
    billCoverPages.forEach((page) => mergedPdf.addPage(page));
  }

  // Serialize the merged PDF
  return await mergedPdf.save();
}


async function validateQuotationInvoice(quotation: {
  grandTotal: number | null;
  id: number;
}, billGroupId: number,
  customDate: string
) {

  // check invoice by quotation id
  const isInvoiceExist = await db.invoice.findFirst({
    select: {
      date: true,
    },
    where: {
      quotationId: quotation.id,
    }
  });

  // if invoice not exist, create new invoice
  if (!isInvoiceExist) {
    const newInvoice = await db.invoice.create({
      data: {
        code: "",
        date: new Date(customDate),
        grandTotal: quotation.grandTotal ?? 0,
        billGroupId: billGroupId,
        quotationId: quotation.id,
      },
    });

    // update code based on invoice id

    const code = generateInvoiceCode(newInvoice.id);
    await db.invoice.update({
      where: {
        id: newInvoice.id,
      },
      data: {
        code,
      }
    });
  } else {
    // if date is not same, update invoice date
    if (isInvoiceExist.date.toISOString() !== new Date(customDate).toISOString()) {
      await db.invoice.update({
        where: {
          quotationId: quotation.id,
        },
        data: {
          date: new Date(customDate),
        }
      });
    }

  }

}