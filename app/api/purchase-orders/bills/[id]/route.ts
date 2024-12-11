import { NextResponse, NextRequest } from "next/server";
import { generateInvoice } from "@/app/services/PDF/pdf.purchase-order";
export async function POST(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = context.params;
  try {
    const data = await req.json() as {
      date: string;
    }

    // default to purchase order
    const res = await generateInvoice(id, data.date);

    if (!res) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 })
    }
    const pdfBytes = res.pdfBytes
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', 'attachment; filename="purchase-order.pdf"')
    return new NextResponse(pdfBytes, { status: 200, statusText: "OK", headers });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("error", err);
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }
}
