"use client";
import React from "react";
import { PenLineIcon, FileEdit } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import PURCHASE_ORDER_SERVICES from "@/app/services/service.purchase-order";
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
  getQuotationGroupByVendor,
  getQuotationTotalPrice,
} from "@/lib/quotation.helper";
import { usePurchasePreviewModal } from "@/hooks/use-po-preview-modal";
import { Button } from "@/components/ui/button";

const columns = [
  { name: "Code", key: "code" },
  {
    name: "Vendor",
    key: "name",
    render: (item: PurchaseOrderWithRelations) => {
      return item.vendor?.name;
    },
  },
  { name: "Discount", key: "totalDiscount" },
  { name: "Total Price", key: "totalPrice" },
  {
    name: "Created",
    key: "createdAt",
    render: (item: PurchaseOrderWithRelations) => {
      return getDateFormat(item.createdAt);
    },
  },
  {
    name: "Status",
    key: "status",
    render: (item: PurchaseOrderWithRelations) => {
      return (
        <Link
          href={`/purchase-orders/${item.id}`}
          className="flex space-x-1  font-semibold items-center rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700"
        >
          <span>{item.status}</span>
          <FileEdit className="w-3 h-3 text-orange-400 cursor-pointer hover:text-orange-700" />
        </Link>
      );
    },
  },
];

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
    const quotationListsByVendor = getQuotationGroupByVendor(quotationLists);
    console.log(quotationListsByVendor);

    const purchaseOrderPreview = Object.keys(quotationListsByVendor).map(
      (vendorId) => {
        const vendorIdNum = Number(vendorId);

        const lists = quotationListsByVendor[vendorIdNum];
        const { totalPrice, totalDiscount, quantity } =
          getQuotationTotalPrice(lists);

        return {
          id: vendorIdNum,
          vendor: lists[0].product.vendor,
          quantity: quantity,
          totalPrice,
          totalDiscount,
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
      <div className="mt-6 bg-gray-50 w-full h-40 rounded flex items-center justify-center">
        <Button
          onClick={previewPurchaseOrders}
          variant="outline"
          className="text-gray-500 text-sm space-x-2">
          <PenLineIcon className="w-5 h-5 text-yellow-500" />
          <span>สร้างใบสั่งซื้อ(PO) จากใบเสนอราคา(QT) แบบอัตโนมัติ</span>
        </Button>
      </div>
    );
  }

  return (
    <PageComponentWrapper
      headerTitle="รายการใบสั่งซื้อ(PO) ของใบเสนอราคานี้"
    >
      {!!data?.length && (
        <TableLists<PurchaseOrderWithRelations> columns={columns} data={data} />
      )}
    </PageComponentWrapper>
  );
}
