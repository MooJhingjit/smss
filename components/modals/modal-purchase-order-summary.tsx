"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { PurchaseOrderWithRelations } from "@/types";
import React, { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAction } from "@/hooks/use-action";
import { updatePurchaseOrder } from "@/actions/po/update";
import { toast } from "sonner";
import { usePurchaseOrderSummaryModal } from "@/hooks/use-po-summary-modal";
import useBillingInfo from "@/app/(platform)/(directory)/purchase-orders/[purchaseOrderId]/_components/useBillingInfo";

export const PurchaseOrderSummaryModal = () => {
  const modal = usePurchaseOrderSummaryModal();
  const data = modal.data;
  console.log(data)

  if (!data) {
    return null;
  }

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>

            <div className="flex space-x-1 items-center">
              <span> สรุปรายการสั่งซื้อ {data?.code}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <MainForm data={data} />
      </DialogContent>
    </Dialog>
  );
};


type FormInput = {
  discount: number;
  extraCost: number;
  price: number;
  tax: number;
  vat: number;
  grandTotal: number;
  totalPrice: number;
};
function MainForm({
  data,
}: {
  data: PurchaseOrderWithRelations;
}) {
  const {
    register,
    handleSubmit,
    isDirty,
    price,
    vat,
    grandTotal,
    onReset,
    onSubmit,
    priceBeforeTax,
    isManual
  } = useBillingInfo({ data });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-gray-100 px-4 py-2 w-full sm:rounded-lg sm:px-6"
    >
      <dl className="divide-y divide-gray-200 text-sm">
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ราคา</dt>
          <dd className="font-medium text-gray-900">
            {isManual ? (
              <Input
                id="price"
                {...register("price")}
                step={0.01}
                type="number"
                className="h-[30px] border border-gray-300 text-right px-2 text-xs focus:ring-0"
                defaultValue={0}
              />
            ) : (
              price?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ส่วนลด</dt>
          <dd className="font-medium text-gray-900">
            <Input
              id="discount"
              {...register("discount")}
              step={0.01}
              type="number"
              className="h-[30px] border border-gray-300 text-right px-2 text-xs focus:ring-0"
              defaultValue={0}
            />
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ต้นทุนเพิ่ม</dt>
          <dd className="font-medium text-gray-900">
            <Input
              id="extraCost"
              {...register("extraCost")}
              type="number"
              step={0.01}
              className="h-[30px] border border-gray-300 text-right px-2 text-xs focus:ring-0  "
              defaultValue={0}
            />
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ราคาก่อนหักภาษี</dt>
          <dd className="font-medium text-gray-900">
            {priceBeforeTax?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">7% Vat</dt>
          <dd className="font-medium text-yellow-600">
            {vat?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">หัก ณ ที่จ่าย 3%</dt>
          <dd className="font-medium text-yellow-600">
            {/* {tax?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0} */}
            <Input
              id="tax"
              {...register("tax")}
              step={0.01}
              type="number"
              className="h-[30px] border border-gray-300 text-right px-2 text-xs focus:ring-0"
              defaultValue={0}
            />
          </dd>
        </div>
        <div className="flex items-center justify-between pt-4">
          <dt className="font-medium text-gray-900">ราคาทั้งหมด</dt>

          <dd className="font-medium text-primary-600 flex items-center space-x-2">
            {isDirty && (
              <div className="flex items-center space-x-3 px-2">
                <Button
                  onClick={onReset}
                  size={"sm"}
                  type="button"
                  variant="link"
                  className="text-xs text-orange-400 underline"
                >
                  ยกเลิก
                </Button>
                <Button size={"sm"} type="submit" className="text-xs">
                  บันทึก
                </Button>
              </div>
            )}
            <span>
              {" "}
              {grandTotal?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0}
            </span>
          </dd>
        </div>
      </dl>
    </form>
  );
}


