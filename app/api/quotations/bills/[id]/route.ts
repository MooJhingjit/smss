import { generateGroupInvoices } from "@/app/services/service.bills";
import { NextResponse, NextRequest } from "next/server";

// Generate all bills for a group of QTs

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const data = await req.json() as {
      date: string;
    };

    // Generate the merged PDF
    const mergedPdfBytes = await generateGroupInvoices(id, data.date);

    // Set response headers and return the merged PDF
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'attachment; filename="product-bills.pdf"');

    return new NextResponse(mergedPdfBytes, { status: 200, statusText: "OK", headers });

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("error", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
