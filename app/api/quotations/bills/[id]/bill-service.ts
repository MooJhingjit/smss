import { generateBillCover } from "@/app/services/PDF/pdf.product-bill-cover";
import { generateInvoice as generateBillToCustomer } from "@/app/services/PDF/pdf.product-bill-to-customer";
import { generateInvoice as generateServiceInvoiceToCustomer } from "@/app/services/PDF/pdf.service-invoice-to-customer";

import { db } from "@/lib/db";
import { generateInvoiceCode } from "@/lib/utils";
import { QT_TYPE } from "@/types";
import { Invoice } from "@prisma/client";
import { PDFDocument } from "pdf-lib";


// create group bills (product and service) and merge them into a single PDF
export async function generateGroupInvoices(id: string, customDate: string) {
  const billGroupId = parseInt(id);
  const quotations = await getQuotationsByGroup(billGroupId);

  const mergedPdf = await PDFDocument.create();
  for (const quotation of quotations) {
    await validateQuotationInvoice(quotation, billGroupId, customDate);

    if (quotation.type === "product") {
      // for service will be created separately later
      const result = await generateBillToCustomer(quotation.id, customDate);
      await addQuotationToMergedPdf(result, quotation.id, mergedPdf);
    } else if (quotation.type === "service") {
      const result = await generateServiceInvoiceToCustomer(quotation.id, customDate);
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
