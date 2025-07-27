"use server";
import { db } from "@/lib/db";
import { generateInvoice as generateBillToCustomer } from "@/app/services/PDF/pdf.product-bill-to-customer";
import { generateInvoice as generateServiceInvoiceToCustomer } from "@/app/services/PDF/pdf.service-invoice-to-customer";
import { generateInstallmentBillCover } from "@/app/services/PDF/pdf.installment-bill-cover";
import { addQuotationToMergedPdf } from "@/app/services/service.bills";
import { generateInvoiceCode } from "@/lib/generate-code.service";
import { PDFDocument } from "pdf-lib";

export async function generateInstallmentInvoice(billGroupId: number, customDate: string) {
    try {
        // Get the installment and its parent quotation from the bill group
        const installment = await getInstallmentByBillGroup(billGroupId);

        if (!installment) {
            throw new Error("No installment found for this bill group");
        }

        const quotation = installment.quotation;

        // Create or validate installment invoice (not quotation invoice)
        await validateInstallmentInvoice(installment, billGroupId, customDate);

        // Create a merged PDF document (same as regular bill generation)
        const mergedPdf = await PDFDocument.create();

        // Generate PDF based on quotation type using existing functions
        let pdfResult;
        if (quotation.type === "product") {
            // Pass installment ID for product invoices to include installment-specific data
            pdfResult = await generateBillToCustomer(quotation.id, customDate, installment.id);
        } else if (quotation.type === "service") {
            // Pass installment ID for service invoices to include installment-specific data
            pdfResult = await generateServiceInvoiceToCustomer(quotation.id, customDate, installment.id);
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

// Validate or create installment invoice (similar to validateQuotationInvoice but for installments)
async function validateInstallmentInvoice(
    installment: {
        id: number;
        quotationId: number;
        amountWithVat: number;
        quotation: {
            type: string;
        };
    },
    billGroupId: number,
    customDate: string
) {
    // Check if installment already has an invoice
    const existingInvoice = await db.invoice.findFirst({
        where: {
            quotationInstallmentId: installment.id,
        },
    });

    if (!existingInvoice) {
        return await createInstallmentInvoice(installment, billGroupId, customDate);
    } else {
        return await updateInstallmentInvoiceDateIfNeeded(existingInvoice, customDate, installment.id);
    }
}

// Create new invoice for installment
async function createInstallmentInvoice(
    installment: {
        id: number;
        quotationId: number;
        amountWithVat: number;
        quotation: {
            type: string;
        };
    },
    billGroupId: number,
    customDate: string
) {
    const invoiceDate = new Date(customDate);
    const newInvoice = await db.invoice.create({
        data: {
            code: "",
            date: invoiceDate,
            grandTotal: installment.amountWithVat, // Use installment amount, not full quotation
            billGroupId: billGroupId,
            quotationId: null, // Set to null for installment-only invoices
            quotationInstallmentId: installment.id, // Specific installment
        },
    });

    const isProduct = installment.quotation.type === "product";

    // Generate invoice code using centralized service
    const code = await generateInvoiceCode(invoiceDate, isProduct);

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

// Update installment invoice date if needed
async function updateInstallmentInvoiceDateIfNeeded(
    invoice: any,
    customDate: string,
    installmentId: number
) {
    if (invoice.date.toISOString() !== new Date(customDate).toISOString()) {
        await db.invoice.update({
            where: {
                quotationInstallmentId: installmentId,
            },
            data: {
                date: new Date(customDate),
            },
        });
    }
    return invoice;
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
