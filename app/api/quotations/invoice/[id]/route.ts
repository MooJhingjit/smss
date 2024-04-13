import { NextResponse, NextRequest } from "next/server";
import { generateInvoice } from "@/app/services/PDF/quotation/pdf.quotation";

export async function POST(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = context.params;
  try {
    const { pdfPath } = await generateInvoice(id);
    const successResult = {
      message: "Success",
      pdfPath,
    };
    return NextResponse.json(successResult);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("error", err);
       return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }
}
