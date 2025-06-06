"use client";
import React, { useEffect, useState } from "react";
import { BadgeInfoIcon, InfoIcon, Plus, ShieldCheckIcon } from "lucide-react";
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
import { reorderQuotationList } from "@/actions/quotation-list/reorder";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsAdmin } from "@/hooks/use-is-admin";

import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

type Props = {
  quotationId: number;
  quotationType: QuotationType;
  data: QuotationListWithRelations[];
  remark: string;
  isLocked: boolean;
  grandTotal: number | null;
};

export default function QuotationLists(props: Props) {
  const { quotationId, quotationType, remark, isLocked, grandTotal } = props;
  const [quotationItems, setQuotationItems] = useState<
    QuotationListWithRelations[]
  >(props.data);
  const modal = useQuotationListModal();
  const isAdmin = useIsAdmin();

  // Update local state when props change
  useEffect(() => {
    setQuotationItems(props.data);
  }, [props.data]);

  const { execute: executeReorder } = useAction(reorderQuotationList, {
    onSuccess: () => {
      toast.success("รายการถูกเรียงลำดับแล้ว");
    },
    onError: (error) => {
      toast.error(error || "เกิดข้อผิดพลาดในการเรียงลำดับรายการ");
      // Reset to original order if server action fails
      setQuotationItems(props.data);
    },
  });

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    {
      id: number;
      payload: {
        allowedWithholdingTax?: boolean;
        hiddenInPdf?: boolean;
      };
    }
  >({
    mutationFn: async (fields) => {
      return await QUOTATION_LIST_SERVICES.put(fields.id, {
        ...fields.payload,
      });
    },
    onSuccess: async () => {
      toast.success("สำเร็จ");
      customRevalidatePath(`/purchase-orders/${quotationId}`);
    },
  });

  // Handle reordering when rows are dragged
  const handleReorder = (result: QuotationListWithRelations[]) => {
    // if (!result.destination) return;

    if (!result) return;
    // const items = Array.from(quotationItems);
    // const [reorderedItem] = items.splice(result.source.index, 1);
    // items.splice(result.destination.index, 0, reorderedItem);

    // Update order field for each item based on new position
    const updatedItems = result.map((item, index) => ({
      ...item,
      order: index,
    }));

    // Update local state immediately for better UX
    setQuotationItems(updatedItems);

    // Prepare data for server action
    const reorderData = {
      quotationId,
      items: updatedItems.map((item) => ({
        id: item.id,
        order: item.order || 0,
      })),
    };

    // Call server action to persist changes
    executeReorder(reorderData);
  };

  // Define all columns
  const allColumns = [
    { name: "#", key: "index" },
    {
      name: "ชื่อสินค้า/บริการ",
      key: "name",
      render: (item: QuotationListWithRelations) => {
        return (
          <div className="">
            <ProductBadge name={item.name} type={item.productType} />
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
      name: "จำนวน",
      key: "quantity",
      render: (item: QuotationListWithRelations) => {
        return (
          <div className="flex items-center justify-start pl-8 space-x-3">
            <p>{item.quantity} </p>{" "}
            {item.unit && <p className="text-xs text-gray-400">{item.unit}</p>}
          </div>
        );
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
        const percentageSign =
          item.percentage && item.percentage >= 0 ? "+" : "";
        return `(${percentageSign}${item.percentage
          }%) ${item.unitPrice?.toLocaleString()}`;
      },
    },
    // Admin-only columns that will be conditionally included
    {
      name: "ซ่อนรายการ",
      key: "hiddenInPdf",
      render: (item: QuotationListWithRelations) => {
        const isDisabled = item.unitPrice !== 0;
        return (
          <div className="flex items-center justify-start pl-8 space-x-3">
            <div className="relative flex items-center">

              {isDisabled ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ราคาขายต้องเป็น 0 ถึงจะซ่อนรายการได้</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Checkbox
                  defaultChecked={!!item.hiddenInPdf}
                  disabled={isDisabled}
                  onCheckedChange={(checked) => {
                    if (!isDisabled) {
                      mutate({
                        id: item.id,
                        payload: {
                          hiddenInPdf: !!checked,
                        },
                      });
                    }
                  }}
                />
              )}
            </div>
          </div>
        );
      },
    },
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
    {
      name: "อัพเดทล่าสุด",
      key: "updatedAt",
      render: (item: QuotationListWithRelations) => {
        const date = new Date(item.updatedAt);
        return date.toLocaleDateString("th-TH");
      },
    },
    {
      name: "ผู้ขาย/ร้านค้า",
      key: "vendor",
      render: (item: QuotationListWithRelations) => {
        return item.product.vendor?.name;
      },
    },
  ];

  // Filter columns based on admin status
  const columns = allColumns.filter(column => {
    // Hide these columns for non-admin users
    if (!isAdmin && (column.key === "hiddenInPdf" || column.key === "withholdingTaxEnabled")) {
      return false;
    }
    return true;
  });

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
          data={quotationItems}
          onDropped={handleReorder}
          showGroupNameAt={"name"}
          onManage={
            // isLocked
            //   ? undefined
            //   :
            (item) => {
              return modal.onOpen(item, {
                quotationRef: {
                  id: item.quotationId,
                  type: quotationType,
                  isLocked,
                },
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
      {quotationItems.length > 0 && (
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="col-span-5 md:col-span-3 ">
            <Remarks id={quotationId} remark={remark} />
          </div>
          <div className="col-span-5 md:col-span-2">
            <BillingSummary
              isAdmin={isAdmin}
              quotationType={quotationType}
              grandTotal={grandTotal}
              data={quotationItems}
            />
          </div>
        </div>
      )}
    </PageComponentWrapper>
  );
}

const BillingSummary = (props: {
  isAdmin: boolean;
  quotationType: QuotationType;
  grandTotal: number | null;
  data: QuotationListWithRelations[];
}) => {
  const { isAdmin, data, quotationType, grandTotal } = props;
  const summary = calculateQuotationItemPrice(data);

  const { execute, isLoading } = useAction(updateServiceQuotationSummary, {
    onSuccess: (data) => { },
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
      {!!grandTotal && (
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
        isAdmin && quotationType === "service" && data.length && !grandTotal && (

          <div className="mt-4">
            <Alert className="">
              <div className="flex justify-center w-full mt-3 space-x-2">
                <InfoIcon className="w-5 h-5 text-orange-500 -mt-1" />
                <AlertTitle>เมื่อยืนยันแล้วจะไม่สามารถแก้ไขยอดรวมได้</AlertTitle>
              </div>
              <AlertDescription>
                <div className="flex justify-center w-full mt-3 ">
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

                    <Button variant={"default"} >
                      ยืนยันยอดรวม
                    </Button>
                  </ConfirmActionButton>
                </div>

              </AlertDescription>
            </Alert>
          </div>

          // <div className="w-full  flex items-center justify-center border mt-3 rounded-md">

          // </div>
        )
      }
    </div>
  );
};
