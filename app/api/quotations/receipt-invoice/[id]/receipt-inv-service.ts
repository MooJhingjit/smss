import { generateInvoice as generateTaxInvoices } from "@/app/services/PDF/pdf.service-receipt-invoice-to-customer";
import { db } from "@/lib/db";
import { Invoice, Quotation, QuotationType } from "@prisma/client";
import { PDFDocument } from "pdf-lib";

export async function generateReceiptInvoice(
  quotationId: number,
  customDate: string
) {
  try {
    const quotation = await getQuotationById(quotationId);

    if (!quotation || !quotation.billGroupId) {
      throw new Error(
        `Quotation with id ${quotationId} not found, or it does not have a bill group id`
      );
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
    await updateReceiptInvoice(invoice, customDate, quotation);
    await printInvoices(quotation.id, customDate, mergedPdf);
    return await mergedPdf.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to generate tax invoice");
    }
  }
}

type QuotationInvoice = {
  id: number;
  billGroupId: number | null;
  grandTotal: number | null;
  purchaseOrderRef: string | null;
  type: QuotationType
}

async function getQuotationById(billGroupId: number): Promise<QuotationInvoice | null> {
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

async function printInvoices(
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

async function updateReceiptInvoice(
  invoice: Invoice,
  customDate: string,
  quotation: QuotationInvoice
) {
  const newInvoiceDate = new Date(customDate);

  // check if the invoice has a receipt code
  if (!invoice.receiptCode) {
    // Generate the invoice code
    const prefix = quotation.type === QuotationType.product ? "" : "S";

    // 1) Find the most recently created quotation (descending by code)
    // that starts with prefix + year + month.
    const year = newInvoiceDate.getFullYear();
    const month = (newInvoiceDate.getMonth() + 1).toString().padStart(2, "0");
    const datePrefix = `${year}-${month}`;

    const lastReceipt = await db.invoice.findFirst({
      where: {
        receiptCode: {
          startsWith: `${prefix}${year}-${month}`,
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    // 2) Parse the last 3 digits to figure out the sequence number
    let nextSequence = 1;
    if (lastReceipt?.receiptCode) {
      nextSequence = parseInt(lastReceipt.receiptCode.slice(-3), 10) + 1;
    }

    // format:  [S]YYYY-MMDDD
    const receiptCode = `${prefix}${datePrefix}${nextSequence
      .toString()
      .padStart(3, "0")}`;

    await db.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        receiptCode,
      },
    });
  }

  if (
    !invoice.receiptDate ||
    invoice.receiptDate.toISOString() !== newInvoiceDate.toISOString()
  ) {
    await db.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        receiptDate: newInvoiceDate,
      },
    });
  }
  return invoice;
}
