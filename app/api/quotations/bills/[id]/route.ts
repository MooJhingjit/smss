import { NextResponse, NextRequest } from "next/server";
import { generateInvoice as generateBilToCustomer } from "@/app/services/PDF/pdf.product-bill-to-customer"


export async function POST(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = context.params;
  try {
    const data = await req.json() as {
      date: string;
    }

    // print 2 templates

    const { pdfBytes } = await generateBilToCustomer(id, data.date);
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', 'attachment; filename="product-bill.pdf"')
    return new NextResponse(pdfBytes, { status: 200, statusText: "OK", headers });

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("error", err);
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }
}
