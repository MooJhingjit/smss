import { generateInvoice as generateTaxInvoices } from "@/app/services/PDF/pdf.service-tax-invoice-to-customer";
import { db } from "@/lib/db";
import { Invoice } from "@prisma/client";
import { PDFDocument } from "pdf-lib";

export async function generateTaxInvoice(
  quotationId: number,
  customDate: string
) {
  try {
    const quotation = await getQuotationById(quotationId);

    if (!quotation || !quotation.billGroupId) {
      throw new Error(`Quotation with id ${quotationId} not found`);
    }

    const invoice = await db.invoice.findFirst({
      where: {
        quotationId: quotation.id,
      },
    });

    if (!invoice) {
      throw new Error(`Invoice with id ${quotationId} not found`);
    }

    const mergedPdf = await PDFDocument.create();
    await updateInvoiceDateIfNeeded(invoice, customDate, quotation.id)
    await createTaxInvoices(quotation.id, customDate, mergedPdf);
    return await mergedPdf.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to generate tax invoice");
    }
  }
}

async function getQuotationById(billGroupId: number) {
  return await db.quotation.findFirst({
    select: {
      id: true,
      grandTotal: true,
      purchaseOrderRef: true,
      billGroupId: true,
      type: true,
    },
    where: {
      id: billGroupId,
    },
  });
}

async function createTaxInvoices(
  quotationId: number,
  customDate: string,
  mergedPdf: PDFDocument
) {
  const results = await generateTaxInvoices(quotationId, customDate);

  if (!results) {
    throw new Error(`Failed to generate PDF for quotation id: ${quotationId}`);
  }

  for (const result of results) {
    await addQuotationToMergedPdf(result, quotationId, mergedPdf);
  }
}

async function addQuotationToMergedPdf(
  pdfResult:
    | {
        pdfBytes: Uint8Array;
      }
    | undefined,
  quotationId: number,
  mergedPdf: PDFDocument
) {
  if (!pdfResult) {
    throw new Error(`Failed to generate PDF for quotation id: ${quotationId}`);
  }

  const { pdfBytes } = pdfResult;
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const copiedPages = await mergedPdf.copyPages(
    pdfDoc,
    pdfDoc.getPageIndices()
  );
  copiedPages.forEach((page) => mergedPdf.addPage(page));
}

async function updateInvoiceDateIfNeeded(
  invoice: Invoice,
  customDate: string,
  quotationId: number
) {
  if (invoice.date.toISOString() !== new Date(customDate).toISOString()) {
    await db.invoice.update({
      where: {
        quotationId: quotationId,
      },
      data: {
        date: new Date(customDate),
      },
    });
  }
  return invoice;
}
