"use client";
import React from "react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import {
  PurchaseOrderItemWithRelations,
  PurchaseOrderWithRelations,
} from "@/types";
import TableLists from "@/components/table-lists";
import { usePurchaseOrderListModal } from "@/hooks/use-po-list-modal";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BillingInfo from "./billing-info";
import ProductBadge from "@/components/badges/product-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { MutationResponseType } from "@/components/providers/query-provider";
import { customRevalidatePath } from "@/actions/revalidateTag";
import PO_ITEM_SERVICES from "@/app/services/api.purchase-order-items";
import Remarks from "./remarks";

type Payload = {
  withholdingTaxEnabled?: boolean;
  vatExcluded?: boolean;
};

export default function PurchaseOrderItems({
  data,
}: {
  data: PurchaseOrderWithRelations;
}) {
  const { purchaseOrderItems, vendor } = data;
  const poListModal = usePurchaseOrderListModal();

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    { id: number; payload: Payload }
  >({
    mutationFn: async (fields) => {
      return await PO_ITEM_SERVICES.put(fields.id, {
        ...fields.payload,
      });
    },
    onSuccess: async () => {
      toast.success("สำเร็จ");
      customRevalidatePath(`/purchase-orders/${data.id}`);
    },
  });

  const columns = [
    { name: "#", key: "index" },
    {
      name: "ชื่อสินค้า",
      key: "name",
      render: (item: PurchaseOrderItemWithRelations) => {
        const { name, type } = item;
        return <ProductBadge name={name} type={type} />;
      },
    },
    {
      name: "ราคาต่อหน่วย",
      key: "unitPrice",
      render: (item: PurchaseOrderItemWithRelations) => {
        return (
          <p>
            {item.unitPrice?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </p>
        );
      },
    },
    {
      name: "จำนวน",
      key: "quantity",
      render: (item: PurchaseOrderItemWithRelations) => {
        return (
          <p>
            {item.quantity} {item.unit}
          </p>
        );
      },
    },
    {
      name: "ราคารวม",
      key: "price",
      render: (item: PurchaseOrderItemWithRelations) => {
        return (
          <p>
            {item.price?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </p>
        );
      },
    },
    {
      name: "สินค้ารับเข้า",
      key: "quantity",
      render: (item: PurchaseOrderItemWithRelations) => {
        const total = item.items.length;
        return (
          <p>
            {total}
          </p>
        );
      },
    },
    {
      name: "หัก ณ ที่จ่าย",
      key: "withholdingTaxEnabled",
      render: (item: PurchaseOrderItemWithRelations) => {
        return (
          <div className="flex items-center justify-start pl-8 space-x-3">
            <Checkbox
              defaultChecked={item.withholdingTaxEnabled}
              disabled={!!item.receiptId}
              onCheckedChange={(checked) => {
                console.log("onCheckedChange", checked);
                mutate({
                  id: item.id,
                  payload: {
                    withholdingTaxEnabled: !!checked,
                  },
                });
              }}
            />
            {item.withholdingTaxEnabled && (
              <p className="text-xs">
                (-
                {item.withholdingTax?.toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                })}
                )
              </p>
            )}
          </div>
        );
      },
    },
    {
      name: "ยกเว้น vat",
      key: "vatExcluded",
      render: (item: PurchaseOrderItemWithRelations) => {
        return (
          <div className="flex items-center justify-start pl-8 space-x-3">
            <Checkbox
              defaultChecked={item.vatExcluded}
              disabled={!!item.receiptId}
              onCheckedChange={(checked) => {
                mutate({
                  id: item.id,
                  payload: {
                    vatExcluded: !!checked,
                  },
                });
              }}
            />
            {item.vatExcluded && (
              <p className="text-xs">
                (-
                {(item.price ? item.price * 0.07 : 0).toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                })}
                )
              </p>
            )}
          </div>
        );
      },
    },
  ];

  if (!purchaseOrderItems) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-sm">ไม่มีข้อมูล</p>
      </div>
    );
  }
  return (
    <PageComponentWrapper
      headerTitle={`รายการสั่งซื้อจาก ${vendor?.name}`}
      headerIcon={
        !data.quotationId && (
          <Button
            onClick={() =>
              poListModal.onOpen(null, { ...data, timestamps: Date.now() })
            }
            variant="secondary"
            className="flex items-center justify-center  h-5 rounded  "
          >
            <Plus className="w-4 h-4 text-gray-400 hover:text-gray-600  cursor-pointer font-semibold" />
          </Button>
        )
      }
    >
      <div className="overflow-x-scroll md:overflow-auto">
        <TableLists<PurchaseOrderItemWithRelations>
          columns={columns}
          data={purchaseOrderItems}
          onManage={(purchaseOrderItem) => {
            poListModal.onOpen(
              purchaseOrderItem as PurchaseOrderItemWithRelations,
              { ...data, timestamps: Date.now() }
            );
          }}
        />
      </div>
      {data && (
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="col-span-5 md:col-span-3 ">
            <Remarks id={data.id} remark={data.remark} />
          </div>
          <div className="col-span-5 md:col-span-2">
            <BillingInfo isManual={!data.quotationId} data={data} />
          </div>
        </div>
      )}
    </PageComponentWrapper>
  );
}
//           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
//             <span className="text-gray-500 sm:text-sm" id="price-currency">
//               บาท
//             </span>
//           </div>
//         </div>
//       </div>

//       <div>
//         <label
//           htmlFor="price"
//           className="block text-sm font-medium leading-6 text-gray-900"
//         >
//           หัก ณ ที่จ่าย 3%
//         </label>
//         <div className="relative mt-2 rounded-md shadow-sm">
//           <Input type="text" name="price" id="price" />
//           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
//             <span className="text-gray-500 sm:text-sm" id="price-currency">
//               บาท
//             </span>
//           </div>
//         </div>
//       </div>

//       <div>
//         <label
//           htmlFor="price"
//           className="block text-sm font-medium leading-6 text-gray-900"
//         >
//           ราคาหลังจากหัก ณ ที่จ่าย
//         </label>
//         <div className="relative mt-2 rounded-md shadow-sm">
//           <Input type="text" name="price" id="price" />
//           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
//             <span className="text-gray-500 sm:text-sm" id="price-currency">
//               บาท
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
