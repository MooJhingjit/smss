import { NextRequest, NextResponse } from "next/server";
import { deletePurchaseOrdersByQuotationId } from "@/app/services/service.purchase-order";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = parseInt(params.id);

    if (isNaN(quotationId)) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 }
      );
    }

    const result = await deletePurchaseOrdersByQuotationId(quotationId);

    return NextResponse.json({
      message: "Purchase orders deleted successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error deleting purchase orders:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase orders" },
      { status: 500 }
    );
  }
}
