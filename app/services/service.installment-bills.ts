"use server";
import { db } from "@/lib/db";
import { generateInvoice as generateBillToCustomer } from "@/app/services/PDF/pdf.product-bill-to-customer";
import { generateInvoice as generateServiceInvoiceToCustomer } from "@/app/services/PDF/pdf.service-invoice-to-customer";
import { generateInstallmentBillCover } from "@/app/services/PDF/pdf.installment-bill-cover";
import { validateQuotationInvoice, addQuotationToMergedPdf } from "@/app/services/service.bills";
import { PDFDocument } from "pdf-lib";

export async function generateInstallmentInvoice(billGroupId: number, customDate: string) {
  try {
    // Get the installment and its parent quotation from the bill group
    const installment = await getInstallmentByBillGroup(billGroupId);
    
    if (!installment) {
      throw new Error("No installment found for this bill group");
    }

    const quotation = installment.quotation;
    
    // Reuse existing validation function from service.bills.ts
    await validateQuotationInvoice(quotation, billGroupId, customDate);

    // Create a merged PDF document (same as regular bill generation)
    const mergedPdf = await PDFDocument.create();

    // Generate PDF based on quotation type using existing functions
    let pdfResult;
    if (quotation.type === "product") {
      pdfResult = await generateBillToCustomer(quotation.id, customDate);
    } else if (quotation.type === "service") {
      pdfResult = await generateServiceInvoiceToCustomer(quotation.id, customDate);
    } else {
      throw new Error(`Unsupported quotation type: ${quotation.type}`);
    }

    // Add the quotation PDF to merged PDF (same pattern as regular bills)
    await addQuotationToMergedPdf(pdfResult, quotation.id, mergedPdf);

    // Add installment-specific bill cover at the end (this will appear at the beginning of final PDF)
    await addInstallmentBillCoverToMergedPdf(billGroupId, mergedPdf);

    // Return the merged PDF bytes
    return await mergedPdf.save();

  } catch (error) {
    console.error("Error generating installment invoice:", error);
    throw error;
  }
}

// Function to add installment bill cover to merged PDF
async function addInstallmentBillCoverToMergedPdf(
  billGroupId: number,
  mergedPdf: PDFDocument
) {
  const billCover = await generateInstallmentBillCover(billGroupId);
  if (billCover) {
    const billCoverDoc = await PDFDocument.load(billCover.pdfBytes);
    const billCoverPages = await mergedPdf.copyPages(
      billCoverDoc,
      billCoverDoc.getPageIndices()
    );
    billCoverPages.forEach((page) => mergedPdf.addPage(page));
  }
}

async function getInstallmentByBillGroup(billGroupId: number) {
  return await db.quotationInstallment.findFirst({
    where: {
      billGroupId: billGroupId,
    },
    include: {
      quotation: {
        select: {
          id: true,
          type: true,
          grandTotal: true,
        }
      }
    }
  });
}
