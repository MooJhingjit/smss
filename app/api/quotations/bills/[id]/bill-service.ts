import { generateBillCover } from "@/app/services/PDF/pdf.product-bill-cover";
import { generateInvoice as generateBillToCustomer } from "@/app/services/PDF/pdf.product-bill-to-customer";
import { generateInvoice as generateServiceInvoiceToCustomer } from "@/app/services/PDF/pdf.service-invoice-to-customer";
import { db } from "@/lib/db";
import { QT_TYPE } from "@/types";
import { Invoice, QuotationType } from "@prisma/client";
import { PDFDocument } from "pdf-lib";

// create group bills (product and service) and merge them into a single PDF
export async function generateGroupInvoices(id: string, customDate: string) {
  const billGroupId = parseInt(id);
  const quotations = await getQuotationsByGroup(billGroupId);
  // console.log("🚀 ~ generateGroupInvoices ~ quotations:", quotations.map((q) => q.id));
  // return

  const mergedPdf = await PDFDocument.create();
  for (const quotation of quotations) {
    await validateQuotationInvoice(quotation, billGroupId, customDate);

    if (quotation.type === "product") {
      // for service will be created separately later
      const result = await generateBillToCustomer(quotation.id, customDate);
      await addQuotationToMergedPdf(result, quotation.id, mergedPdf);
    } else if (quotation.type === "service") {
      const result = await generateServiceInvoiceToCustomer(
        quotation.id,
        customDate
      );
      await addQuotationToMergedPdf(result, quotation.id, mergedPdf);
    }
  }

  await addBillCoverToMergedPdf(billGroupId, mergedPdf);

  return await mergedPdf.save();
}

async function getQuotationsByGroup(billGroupId: number) {
  return await db.quotation.findMany({
    select: {
      id: true,
      grandTotal: true,
      purchaseOrderRef: true,
      type: true,
    },
    where: {
      billGroupId,
    },
    orderBy: {
      id: 'asc'
    }
  });
}

async function validateQuotationInvoice(
  quotation: {
    grandTotal: number | null;
    id: number;
    type: QT_TYPE;
  },
  billGroupId: number,
  customDate: string
) {
  const invoice = await db.invoice.findFirst({
    where: {
      quotationId: quotation.id,
    },
  });

  if (!invoice) {
    return await createNewInvoice(quotation, billGroupId, customDate);
  } else {
    return await updateInvoiceDateIfNeeded(invoice, customDate, quotation.id);
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

async function addBillCoverToMergedPdf(
  billGroupId: number,
  mergedPdf: PDFDocument
) {
  const billCover = await generateBillCover(billGroupId);
  if (billCover) {
    const billCoverDoc = await PDFDocument.load(billCover.pdfBytes);
    const billCoverPages = await mergedPdf.copyPages(
      billCoverDoc,
      billCoverDoc.getPageIndices()
    );
    billCoverPages.forEach((page) => mergedPdf.addPage(page));
  }
}

async function createNewInvoice(
  quotation: { grandTotal: number | null; id: number; type: QT_TYPE },
  billGroupId: number,
  customDate: string
) {
  const invoiceDate = new Date(customDate);
  const newInvoice = await db.invoice.create({
    data: {
      code: "",
      date: invoiceDate,
      grandTotal: quotation.grandTotal ?? 0,
      billGroupId: billGroupId,
      quotationId: quotation.id,
    },
  });
  const isProduct = quotation.type === QuotationType.product;

  // Generate the invoice code
  const prefix = isProduct ? "" : "S";

  // 1) Find the most recently created quotation (descending by code)
  // that starts with prefix + year + month.
  const year = invoiceDate.getFullYear();
  const month = (invoiceDate.getMonth() + 1).toString().padStart(2, "0");
  const datePrefix = `${year}-${month}`;

  const lastInvoice = await db.invoice.findFirst({
    where: {
      code: {
        startsWith: `${prefix}${year}-${month}`,
      },
    },
    orderBy: {
      code: "desc",
    },
  });

  // 2) Parse the last 3 digits to figure out the sequence number
  let nextSequence = 1;
  if (lastInvoice?.code) {
    nextSequence = parseInt(lastInvoice.code.slice(-3), 10) + 1;
  }

  // format:  [S]YYYY-MMDDD
  const code = `${prefix}${datePrefix}${nextSequence
    .toString()
    .padStart(3, "0")}`;

  // for product, the code and data are the same for code and receiptCode

  const data = {
    code,
    date: invoiceDate,
    receiptCode: isProduct ? code : "",
    receiptDate: isProduct ? invoiceDate : null,
  };

  await db.invoice.update({
    where: {
      id: newInvoice.id,
    },
    data,
  });

  return newInvoice;
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
