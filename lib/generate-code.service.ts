import { db } from "@/lib/db";
import { QuotationType } from "@prisma/client";

export const codeLength = 6;

export function generateCode(
  id: number,
  prefix: "S_QT" | "QT" | "PO",
  date: Date,
  number: number
) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const runNumber = number.toString().padStart(4, "0");

  return `${prefix}${year}${month}${runNumber}`;
}

export function parseSequenceNumber(code: string): number {
  if (!code) {
    return 1;
  }
  // If there's a dash (e.g. "-R1"), split to remove the revision suffix.
  const dashIndex = code.indexOf("-");
  const baseCode = dashIndex >= 0 ? code.substring(0, dashIndex) : code;
  // The sequence is always the last 4 digits of the base code.
  const seqStr = baseCode.slice(-4);
  return parseInt(seqStr, 10) + 1;
}

export const generateQuotationCode = async (quotationId: number, type: QuotationType, createdAt: Date) => {
  const prefix = type === QuotationType.product ? "QT" : "S_QT";
  const year = createdAt.getFullYear();
  const month = (createdAt.getMonth() + 1).toString().padStart(2, "0");
  
  // Find the most recently created quotation (descending by code)
  // that starts with prefix + year + month.
  const lastQuotation = await db.quotation.findFirst({
    where: {
      type,
      code: {
        startsWith: `${prefix}${year}${month}`,
      },
    },
    orderBy: {
      code: "desc",
    },
  });

  // Parse the last 4 digits to figure out the sequence number
  const nextSequence = parseSequenceNumber(lastQuotation?.code ?? "");

  // Generate code based on quotation ID
  return generateCode(quotationId, prefix, createdAt, nextSequence);
};

export const generatePurchaseOrderCode = async (purchaseOrderId: number, createdAt: Date) => {
  const prefix = "PO";
  const year = createdAt.getFullYear();
  const month = (createdAt.getMonth() + 1).toString().padStart(2, "0");
  
  // Find the most recently created purchase order (descending by code)
  // that starts with prefix + year + month.
  const lastPO = await db.purchaseOrder.findFirst({
    where: {
      code: {
        startsWith: `${prefix}${year}${month}`,
      },
    },
    orderBy: {
      code: "desc",
    },
  });

  // Parse the last 4 digits to figure out the sequence number
  const nextSequence = parseSequenceNumber(lastPO?.code ?? "");

  // Generate code based on purchase order ID
  return generateCode(purchaseOrderId, prefix, createdAt, nextSequence);
};

export const getNextPurchaseOrderSequence = async (createdAt: Date) => {
  const year = createdAt.getFullYear();
  const month = (createdAt.getMonth() + 1).toString().padStart(2, "0");
  
  // Find the most recently created purchase order (descending by code)
  // that starts with prefix + year + month.
  const lastPO = await db.purchaseOrder.findFirst({
    where: {
      code: {
        startsWith: `PO${year}${month}`,
      },
    },
    orderBy: {
      code: "desc",
    },
  });

  // Parse the last 4 digits to figure out the sequence number
  return parseSequenceNumber(lastPO?.code ?? "");
};

export const generateBillGroupCode = async (BILL_GROUP_DATE: Date) => {
  const year = BILL_GROUP_DATE.getFullYear();
  const month = (BILL_GROUP_DATE.getMonth() + 1).toString().padStart(2, "0");

  const datePrefix = `${year}-${month}`;
  const lastBillGroup = await db.billGroup.findFirst({
    where: {
      code: {
        startsWith: datePrefix,
      },
    },
    orderBy: {
      code: "desc",
    },
  });

  // 2) Parse the last 3 digits to figure out the sequence number
  let nextSequence = 1;
  if (lastBillGroup?.code) {
    nextSequence = parseInt(lastBillGroup.code.slice(-3), 10) + 1;
  }

  // update code based on quotation ID
  // format: YYYY-MM001
  const code = `${datePrefix}${nextSequence.toString().padStart(3, "0")}`;

  return code;
};

export const generateInvoiceCode = async (invoiceDate: Date, isProduct: boolean) => {
  const prefix = isProduct ? "" : "S";
  const year = invoiceDate.getFullYear();
  const month = (invoiceDate.getMonth() + 1).toString().padStart(2, "0");

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

  // Parse the last 3 digits to figure out the sequence number
  let nextSequence = 1;
  if (lastInvoice?.code) {
    nextSequence = parseInt(lastInvoice.code.slice(-3), 10) + 1;
  }

  // format: [S]YYYY-MMDDD
  const code = `${prefix}${year}-${month}${nextSequence.toString().padStart(3, "0")}`;

  return code;
};
