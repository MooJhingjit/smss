import { generateBillCover } from "@/app/services/PDF/pdf.product-bill-cover";
import { generateInvoice as generateBillToCustomer } from "@/app/services/PDF/pdf.product-bill-to-customer";
import { generateInvoice as generateServiceBillToCustomer } from "@/app/services/PDF/pdf.service-bills-to-customer";

import { db } from "@/lib/db";
import { generateInvoiceCode } from "@/lib/utils";
import { QT_TYPE } from "@/types";
import { Invoice } from "@prisma/client";
import { PDFDocument } from "pdf-lib";

export async function generateGroupInvoices(id: string, customDate: string) {
  const billGroupId = parseInt(id);
  const quotations = await getQuotations(billGroupId);

  const mergedPdf = await PDFDocument.create();
  for (const quotation of quotations) {
    await validateQuotationInvoice(quotation, billGroupId, customDate);
    await createBills(quotation.id, quotation.type, customDate, mergedPdf);
  }

  await addBillCoverToMergedPdf(billGroupId, mergedPdf);

  return await mergedPdf.save();
}

async function getQuotations(billGroupId: number) {
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
  });
}

async function createBills(quotationId: number, quotationType: QT_TYPE, customDate: string, mergedPdf: PDFDocument) {
  if (quotationType === "product") {
    const result = await generateBillToCustomer(quotationId, customDate);
    await addQuotationToMergedPdf(result, quotationId, mergedPdf)

  } else {
    const results = await generateServiceBillToCustomer(quotationId, customDate);

    if (!results) {
      throw new Error(`Failed to generate PDF for quotation id: ${quotationId}`);
    }

    for (const result of results) {
      await addQuotationToMergedPdf(result, quotationId, mergedPdf)
    }

  }
}

async function addQuotationToMergedPdf(pdfResult:
  {
    pdfBytes: Uint8Array
  } | undefined
  , quotationId: number
  , mergedPdf: PDFDocument) {

  if (!pdfResult) {
    throw new Error(`Failed to generate PDF for quotation id: ${quotationId}`);
  }

  const { pdfBytes } = pdfResult;
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
  copiedPages.forEach((page) => mergedPdf.addPage(page));
}

async function addBillCoverToMergedPdf(billGroupId: number, mergedPdf: PDFDocument) {
  const billCover = await generateBillCover(billGroupId);
  if (billCover) {
    const billCoverDoc = await PDFDocument.load(billCover.pdfBytes);
    const billCoverPages = await mergedPdf.copyPages(billCoverDoc, billCoverDoc.getPageIndices());
    billCoverPages.forEach((page) => mergedPdf.addPage(page));
  }
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

async function createNewInvoice(quotation: { grandTotal: number | null; id: number; type: QT_TYPE }, billGroupId: number, customDate: string) {
  const newInvoice = await db.invoice.create({
    data: {
      code: "",
      date: new Date(customDate),
      grandTotal: quotation.grandTotal ?? 0,
      billGroupId: billGroupId,
      quotationId: quotation.id,
    },
  });

  const code = generateInvoiceCode(newInvoice.id, quotation.type);
  await db.invoice.update({
    where: {
      id: newInvoice.id,
    },
    data: {
      code,
    },
  });

  return newInvoice;
}

async function updateInvoiceDateIfNeeded(invoice: Invoice, customDate: string, quotationId: number) {
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
