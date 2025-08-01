import { NextResponse, NextRequest } from "next/server";
import { generateReceiptBill } from "@/app/services/service.receipt-bill";

// Generate receipt bill for a specific installment (service quotations only)

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const data = await req.json() as {
      receiptDate: string;
    };

    // Generate the installment receipt PDF using consolidated service
    const receiptPdfBytes = await generateReceiptBill({
      installmentId: parseInt(id),
      receiptDate: data.receiptDate,
    });

    // Set response headers and return the PDF
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'attachment; filename="installment-receipt.pdf"');

    return new NextResponse(receiptPdfBytes as BodyInit, { status: 200, statusText: "OK", headers });

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("error", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
