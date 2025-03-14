"use client";
import React from "react";
import { PenLineIcon, FileEdit, ExternalLink } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import PURCHASE_ORDER_SERVICES from "@/app/services/api.purchase-order";
import {
  PurchaseOrderWithRelations,
  QuotationListWithRelations,
  PurchaseOrderPreview,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import TableLists from "@/components/table-lists";
import { getDateFormat } from "@/lib/utils";
import Link from "next/link";
import {
  groupQuotationByVendor,
  calculateQuotationItemPrice,
} from "@/app/services/service.quotation";
import { usePurchasePreviewModal } from "@/hooks/use-po-preview-modal";
import { Button } from "@/components/ui/button";
import { purchaseOrderColumns } from "../../../purchase-orders";

export default function PurchaseOrders(props: {
  quotationLists: QuotationListWithRelations[];
  hasQuotationItems: boolean;
  quotationId: number;
}) {
  const { quotationId, quotationLists } = props;
  const queryKey = ["purchase-orders", quotationId];

  const modal = usePurchasePreviewModal();

  const { data } = useQuery<PurchaseOrderWithRelations[]>({
    queryKey,
    queryFn: async () => {
      return await PURCHASE_ORDER_SERVICES.get({
        quotationId,
      });
    },
  });

  const previewPurchaseOrders = () => {
    const quotationListsByVendor = groupQuotationByVendor(quotationLists);
    const purchaseOrderPreview = Object.keys(quotationListsByVendor).map(
      (vendorId) => {
        const vendorIdNum = Number(vendorId);

        const lists = quotationListsByVendor[vendorIdNum];

        // all lists are from the same vendor
        const { totalCost, quantity } = calculateQuotationItemPrice(lists);

        return {
          id: vendorIdNum,
          vendor: lists[0].product.vendor,
          quantity: quantity,
          totalCost,
        };
      }
    );

    modal.onOpen(
      purchaseOrderPreview as PurchaseOrderPreview[],
      queryKey,
      quotationId
    );
  };

  // const renderActionButtons = () => {
  //   if (data?.length) {
  //     return;
  //   }
  //   return (
  //     <button
  //       onClick={previewPurchaseOrders}
  //       className="flex items-center justify-center  bg-gray-50 hover:text-gray-700 border border-gray-300 rounded text-xs px-4 py-0.5"
  //     >
  //       Generate
  //     </button>
  //   );
  // };

  if (!data?.length) {
    return (
      <div className="mt-6 bg-green-100 border border-green-600 w-full h-40 rounded flex items-center justify-center">
        <div className="space-y-3">
          <div className="">
            <p className="text-green-700 text-sm">
              - สร้าง <b>ใบสั่งซื้อ(PO)</b> จากใบเสนอราคา(QT) แบบอัตโนมัติ
            </p>
            <p className="text-green-700 text-sm">
              - ตรวจสอบรายการสินค้าและยอดรวม ก่อนสร้างใบสั่งซื้อ
            </p>
          </div>
          <div className="text-center">
            <Button
              onClick={previewPurchaseOrders}
              variant="outline"
              className="text-gray-500 text-sm space-x-2"
            >
              <PenLineIcon className="w-5 h-5 text-green-500" />
              <span>สร้าง</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageComponentWrapper headerTitle="รายการใบสั่งซื้อ(PO) ของใบเสนอราคานี้">
      {!!data?.length && (
        <TableLists<PurchaseOrderWithRelations>
          columns={purchaseOrderColumns}
          data={data}
        />
      )}
    </PageComponentWrapper>
  );
}
