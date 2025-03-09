"use client";
import React, { useEffect } from "react";
import { InfoIcon, Plus, ShieldCheckIcon } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import TableLists from "@/components/table-lists";
import { useQuotationListModal } from "@/hooks/use-quotation-list";
import { QuotationListWithRelations } from "@/types";
import { FormTextarea } from "@/components/form/form-textarea";
import { useForm } from "react-hook-form";
import { useAction } from "@/hooks/use-action";
import {
  updateQuotation,
  updateServiceQuotationSummary,
} from "@/actions/quotation/update";
import { toast } from "sonner";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { QuotationType } from "@prisma/client";
import ProductBadge from "@/components/badges/product-badge";
import { calculateQuotationItemPrice } from "@/app/services/service.quotation";
import Remarks from "./remarks";
import ConfirmActionButton from "@/components/confirm-action";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { MutationResponseType } from "@/components/providers/query-provider";
import { customRevalidatePath } from "@/actions/revalidateTag";
import QUOTATION_LIST_SERVICES from "@/app/services/api.quotation-lists";

type Props = {
  quotationId: number;
  quotationType: QuotationType;
  data: QuotationListWithRelations[];
  remark: string;
  isLocked: boolean;
  grandTotal: number | null;
};

export default function QuotationLists(props: Props) {
  const { data, quotationId, quotationType, remark, isLocked, grandTotal } =
    props;
  const modal = useQuotationListModal();

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    { id: number; payload: {
      allowedWithholdingTax: boolean;
    } }
  >({
    mutationFn: async (fields) => {
      return await QUOTATION_LIST_SERVICES.put(fields.id, {
        ...fields.payload,
      });
    },
    onSuccess: async () => {
      toast.success("สำเร็จ");
      customRevalidatePath(`/purchase-orders/${props.quotationId}`);
    },
  });
  const columns = [
    { name: "#", key: "index" },
    {
      name: "ชื่อสินค้า/บริการ",
      key: "name",
      render: (item: QuotationListWithRelations) => {
        return (
          <div className="">
            <ProductBadge name={item.product.name} type={item.product.type} />
            {item.subItems && !!JSON.parse(item.subItems).length && (
              <div className="text-xs text-gray-400">
                <span>+</span>
                <span>{JSON.parse(item.subItems).length}</span>
                <span> รายการย่อย</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      name: "ผู้ขาย/ร้านค้า",
      key: "vendor",
      render: (item: QuotationListWithRelations) => {
        return item.product.vendor?.name;
      },
    },
    {
      name: "ต้นทุน",
      key: "cost",
    },
    {
      name: "ราคาต่อหน่วย",
      key: "unitPrice",
      render: (item: QuotationListWithRelations) => {
        return `(+${item.percentage}%) ${item.unitPrice?.toLocaleString()}`;
      },
    },
    { name: "จำนวน", key: "quantity" },
    {
      name: "รายการหัก ณ ที่จ่าย",
      key: "withholdingTaxEnabled",
      render: (item: QuotationListWithRelations) => {
        return (
          <div className="flex items-center justify-start pl-8 space-x-3">
            <Checkbox
              defaultChecked={!!item.allowedWithholdingTax}
              onCheckedChange={(checked) => {
                mutate({
                  id: item.id,
                  payload: {
                    allowedWithholdingTax: !!checked,
                  },
                });
              }}
            />
          </div>
        );
      },
    },
    // {
    //   name: "ภาษี",
    //   key: "withholdingTaxPercent",
    //   render: (item: QuotationListWithRelations) => {
    //     return `(+${item.withholdingTaxPercent}%) ${item.withholdingTax?.toLocaleString()}`;
    //   },
    // },
    {
      name: "ส่วนลด",
      key: "discount",
    },
    {
      name: "ยอดรวม",
      key: "totalPrice",
      render: (item: QuotationListWithRelations) => {
        return item.totalPrice?.toLocaleString();
      },
    },

    // { name: "Price", key: "price" },
    {
      name: "อัพเดทล่าสุด",
      key: "quantity",
      render: (item: QuotationListWithRelations) => {
        const date = new Date(item.updatedAt);
        return date.toLocaleDateString("th-TH");
      },
    },
  ];

  const listLabel = isLocked ? "" : "เพิ่มรายการสินค้า/บริการ";
  return (
    <PageComponentWrapper
      headerTitle={listLabel}
      headerIcon={
        !isLocked && (
          <Button
            onClick={() =>
              !isLocked &&
              modal.onOpen(undefined, {
                quotationRef: { id: quotationId, type: quotationType },
                timestamps: Date.now(),
              })
            }
            disabled={isLocked}
            variant="default"
            className="flex items-center justify-center  h-5 rounded bg-yellow-50 hover:bg-yellow-500 border border-yellow-600"
          >
            <Plus className="w-4 h-4 text-yellow-700  cursor-pointer font-semibold" />
          </Button>
        )
      }
    >
      <div className="overflow-x-scroll md:overflow-auto">
        <TableLists<QuotationListWithRelations>
          columns={columns}
          data={data}
          onManage={
            isLocked
              ? undefined
              : (item) => {
                  return modal.onOpen(item, {
                    quotationRef: { id: item.quotationId, type: quotationType },
                    productRef: {
                      id: item.productId ?? 0,
                      name: item.product?.name ?? "",
                    },
                    timestamps: Date.now(),
                  });
                }
          }
        />
      </div>
      {data.length > 0 && (
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="col-span-5 md:col-span-3 ">
            <Remarks id={quotationId} remark={remark} />
          </div>
          <div className="col-span-5 md:col-span-2">
            <BillingSummary
              quotationType={quotationType}
              grandTotal={grandTotal}
              data={data}
            />
          </div>
        </div>
      )}
    </PageComponentWrapper>
  );
}

const BillingSummary = (props: {
  quotationType: QuotationType;
  grandTotal: number | null;
  data: QuotationListWithRelations[];
}) => {
  const { data, quotationType, grandTotal } = props;
  const summary = calculateQuotationItemPrice(data);

  const { execute, isLoading } = useAction(updateServiceQuotationSummary, {
    onSuccess: (data) => {},
    onError: (error) => {
      toast.error(error);
    },
  });

  return (
    <div
      className={cn(" p-4 w-full sm:rounded-lg sm:px-6", {
        "bg-gray-50 border": !!grandTotal,
        " border-green-700 bg-white": grandTotal, // confirmed
      })}
    >
      {grandTotal && (
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="w-4 h-4 text-green-800" />
          <p className="text-green-800">
            ใบเสนอราคานี้ได้รับการยืนยันแล้ว ไม่สามารถแก้ไขได้
          </p>
        </div>
      )}
      <dl className="divide-y divide-gray-200 text-sm">
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">Subtotal</dt>
          <dd className="font-medium text-gray-900">
            {summary.totalPrice.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">Discount</dt>
          <dd className="font-medium text-gray-900">
            {summary.discount.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">7% Vat</dt>
          <dd className="font-medium text-gray-900">
            {summary.vat.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
        <div className="flex items-center justify-between pt-4">
          <dt className="font-medium text-gray-900">Grand Total</dt>
          <dd className="font-medium text-primary-600">
            {summary.grandTotal.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
      </dl>

      {
        // this qt haven't been confirmed yet (this is only for service quotation)
        quotationType === "service" && data.length && !grandTotal && (
          <div className="w-full  flex items-center justify-center">
            <ConfirmActionButton
              onConfirm={() => {
                execute({
                  id: data[0].quotationId,
                  totalPrice: summary.totalPrice,
                  discount: summary.discount,
                  tax: summary.vat,
                  grandTotal: summary.grandTotal,
                });
              }}
            >
              <Button className="mt-4 w-full space-x-1 flex flex-col  p-3 h-auto">
                <div className=" flex items-center justify-center space-x-2">
                  <InfoIcon className="w-4 h-4 text-orange-500" />
                  <p>รายการนี้ยังไม่ได้รับการยืนยัน กดเพื่อยืนยันยอดรวม</p>
                </div>
                <p className="text-xs">
                  เมื่อยืนยันแล้วจะไม่สามารถแก้ไขยอดรวมได้
                </p>
              </Button>
            </ConfirmActionButton>
          </div>
        )
      }
    </div>
  );
};
