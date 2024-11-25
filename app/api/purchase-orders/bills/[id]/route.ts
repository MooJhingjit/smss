import { NextResponse, NextRequest } from "next/server";
import { generateInvoice } from "@/app/services/PDF/pdf.purchase-order";
import { generateInvoice as generateProductBill } from "@/app/services/PDF/pdf.product-bill-to-customer"


export async function POST(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = context.params;
  try {
    const data = await req.json() as {
      date: string;
      type: "po-to-vendor" | "product-to-customer"
    }

    if (data.type === "product-to-customer") {
      const { pdfBytes } = await generateProductBill(id, data.date);
      const headers = new Headers()
      headers.set('Content-Type', 'application/pdf')
      headers.set('Content-Disposition', 'attachment; filename="product-bill.pdf"')
      return new NextResponse(pdfBytes, { status: 200, statusText: "OK", headers });
    }

    // default to purchase order
    const { pdfBytes } = await generateInvoice(id, data.date);
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
