import { NextResponse, NextRequest } from "next/server";
import { loadQuotation } from "@/app/services/PDF/quotation/pdf.quotation";

export async function POST(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = context.params;
  try {
    const { pdfPath } = await loadQuotation(id);
    const successResult = {
      message: "Success",
      pdfPath,
    };
    return NextResponse.json(successResult);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
