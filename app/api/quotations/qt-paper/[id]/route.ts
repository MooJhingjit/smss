import { NextResponse, NextRequest } from "next/server";
import { generateQuotationPaper } from "@/app/services/PDF/pdf.quotation";

export async function POST(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = context.params;
  const data = await req.json() as {
    date: string;
  }
  try {
    const result = await generateQuotationPaper(id, data.date);
    if (!result) {
      throw new Error("Failed to generate invoice");
    }
    const { pdfBytes } = result;
 
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', 'attachment; filename="download.pdf"')
    return new NextResponse(pdfBytes, { status: 200, statusText: "OK", headers });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("error", err);
       return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }
}
