import { generateInvoice as generateServiceReceiptInvoiceToCustomer } from "@/app/services/PDF/pdf.service-receipt-invoice-to-customer";
import { db } from "@/lib/db";
import { Invoice, QuotationType, QuotationInstallment } from "@prisma/client";
import { PDFDocument } from "pdf-lib";

interface ReceiptBillOptions {
  receiptDate: string;
  quotationId?: number;
  installmentId?: number;
}

export async function generateReceiptBill(options: ReceiptBillOptions): Promise<Uint8Array> {
  const { receiptDate, quotationId, installmentId } = options;

  if (!quotationId && !installmentId) {
    throw new Error("Either quotationId or installmentId must be provided");
  }

  if (quotationId && installmentId) {
    throw new Error("Cannot process both quotationId and installmentId at the same time");
  }

  try {
    if (installmentId) {
      return await generateInstallmentReceiptBill(installmentId, receiptDate);
    } else if (quotationId) {
      return await generateQuotationReceiptBill(quotationId, receiptDate);
    }
    
    throw new Error("Either quotationId or installmentId must be provided");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to generate receipt bill");
    }
  }
}

// Generate receipt bill for quotation (existing logic)
async function generateQuotationReceiptBill(quotationId: number, receiptDate: string) {
  const quotation = await getQuotationById(quotationId);

  if (!quotation?.billGroupId) {
    throw new Error(
      `Quotation with id ${quotationId} not found, or it does not have a bill group id`
    );
  }

  if (quotation.type !== QuotationType.service) {
    throw new Error("Receipt bills are only available for service quotations");
  }

  const invoice = await db.invoice.findFirst({
    where: {
      quotationId: quotation.id,
    },
  });

  if (!invoice) {
    throw new Error(`Invoice for quotation ${quotationId} not found`);
  }

  const mergedPdf = await PDFDocument.create();
  await updateReceiptInvoice(invoice, receiptDate, quotation, null);
  await printInvoices(quotation.id, receiptDate, mergedPdf, null);
  return await mergedPdf.save();
}

// Generate receipt bill for installment (new logic)
async function generateInstallmentReceiptBill(installmentId: number, receiptDate: string) {
  // Get the installment with its quotation
  const installment = await db.quotationInstallment.findUnique({
    where: { id: installmentId },
    include: {
      quotation: {
        include: {
          contact: true,
          seller: true,
          lists: true,
        }
      },
      invoice: true,
    }
  });

  if (!installment) {
    throw new Error("Installment not found");
  }

  if (!installment.billGroupId) {
    throw new Error("Installment must have a bill group to generate receipt");
  }

  const quotation = installment.quotation;
  
  if (quotation.type !== QuotationType.service) {
    throw new Error("Receipt bills are only available for service quotations");
  }

  // Check if invoice exists for this installment
  if (!installment.invoice) {
    throw new Error("Invoice must be generated first before creating receipt");
  }

  const mergedPdf = await PDFDocument.create();
  await updateReceiptInvoice(installment.invoice, receiptDate, quotation, installment);
  await printInvoices(quotation.id, receiptDate, mergedPdf, installment);
  return await mergedPdf.save();
}

type QuotationInvoice = {
  id: number;
  billGroupId: number | null;
  grandTotal: number | null;
  purchaseOrderRef: string | null;
  type: QuotationType;
}

async function getQuotationById(quotationId: number): Promise<QuotationInvoice | null> {
  return await db.quotation.findFirst({
    select: {
      id: true,
      grandTotal: true,
      purchaseOrderRef: true,
      billGroupId: true,
      type: true,
    },
    where: {
      id: quotationId,
    },
  });
}

async function printInvoices(
  quotationId: number,
  receiptDate: string,
  mergedPdf: PDFDocument,
  installment: QuotationInstallment | null
) {
  const results = await generateServiceReceiptInvoiceToCustomer(
    quotationId, 
    receiptDate, 
    installment?.id
  );

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
  receiptDate: string,
  quotation: QuotationInvoice,
  installment: QuotationInstallment | null
) {
  const newReceiptDate = new Date(receiptDate);

  // Generate receipt code if not exists
  if (!invoice.receiptCode) {
    const receiptCode = await generateReceiptCode(newReceiptDate, installment !== null);
    
    await db.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        receiptCode,
      },
    });
  }

  // Update receipt date if different
  if (
    !invoice.receiptDate ||
    invoice.receiptDate.toISOString() !== newReceiptDate.toISOString()
  ) {
    await db.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        receiptDate: newReceiptDate,
      },
    });
  }
  
  return invoice;
}

async function generateReceiptCode(receiptDate: Date, isInstallment: boolean): Promise<string> {
  // Different prefixes for regular service receipts vs installment receipts
  const prefix = "S"; 
  
  const year = receiptDate.getFullYear();
  const month = (receiptDate.getMonth() + 1).toString().padStart(2, "0");
  const datePrefix = `${year}-${month}`;

  const whereClause = isInstallment 
    ? {
        receiptCode: {
          startsWith: `${prefix}${year}-${month}`,
        },
        quotationInstallmentId: {
          not: null,
        },
      }
    : {
        receiptCode: {
          startsWith: `${prefix}${year}-${month}`,
        },
        quotationInstallmentId: null,
      };

  const lastReceipt = await db.invoice.findFirst({
    where: whereClause,
    orderBy: {
      receiptCode: "desc",
    },
  });

  // Parse the last 3 digits to figure out the sequence number
  let nextSequence = 1;
  if (lastReceipt?.receiptCode) {
    nextSequence = parseInt(lastReceipt.receiptCode.slice(-3), 10) + 1;
  }

  // Format: [S|SI]YYYY-MMDDD
  return `${prefix}${datePrefix}${nextSequence.toString().padStart(3, "0")}`;
}
