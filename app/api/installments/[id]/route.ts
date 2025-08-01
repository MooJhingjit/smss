import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { createInstallmentBillGroup } from "@/app/services/service.quotation-installment";
import { generateInstallmentInvoice } from "@/app/services/service.installment-bills";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const installmentId = parseInt(params.id);
    if (isNaN(installmentId)) {
      return NextResponse.json({ error: "Invalid installment ID" }, { status: 400 });
    }

    const body = await request.json();
    const { billGroupDate } = body;

    // Create new bill group or get existing one for this installment
    const result = await createInstallmentBillGroup({
      installmentId,
      billGroupDate: billGroupDate, // Empty string for existing bill groups
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const { billGroup } = result.data;

    if (!billGroup) {
      return NextResponse.json({ error: "Failed to create or retrieve bill group" }, { status: 500 });
    }

    // Always generate and return PDF
    const billGroupDateToUse = billGroup.date ? billGroup.date.toISOString() : new Date().toISOString();
    
    const pdfBytes = await generateInstallmentInvoice(
      billGroup.id,
      billGroupDateToUse
    );

    // Set response headers and return the PDF
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'attachment; filename="installment-invoice.pdf"');

    return new NextResponse(pdfBytes as BodyInit, { status: 200, statusText: "OK", headers });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const installmentId = parseInt(params.id);
    if (isNaN(installmentId)) {
      return NextResponse.json({ error: "Invalid installment ID" }, { status: 400 });
    }

    const { getInstallmentBillGroups } = await import("@/app/services/service.quotation-installment");
    const result = await getInstallmentBillGroups(installmentId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
