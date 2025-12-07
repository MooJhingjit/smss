"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "../ui/custom-input";
import { Button } from "@/components/ui/button";
import { PurchaseOrderWithRelations } from "@/types";
import React, { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAction } from "@/hooks/use-action";
import { updatePurchaseOrder } from "@/actions/po/update";
import { toast } from "sonner";
import { usePurchaseOrderSummaryModal } from "@/hooks/use-po-summary-modal";
import useBillingInfo from "@/app/(platform)/(directory)/purchase-orders/[purchaseOrderId]/_components/useBillingInfo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

export const PurchaseOrderSummaryModal = () => {
  const modal = usePurchaseOrderSummaryModal();
  const data = modal.data;
  console.log(data);

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
function MainForm({ data }: { data: PurchaseOrderWithRelations }) {
  const {
    register,
    handleSubmit,
    isDirty,
    price,
    discount,
    extraCost,
    vat,
    grandTotal,
    onReset,
    onSubmit,
    priceBeforeVat,
    isManual,
  } = useBillingInfo({ data });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className="grid grid-cols-12   gap-6">
        <ItemList label="ราคา">
          {isManual ? (
            <Input
              id="price"
              {...register("price")}
              step={0.01}
              type="number"
              className=" border border-gray-300 text-right px-2 text-xs focus:ring-0"
              defaultValue={0}
            />
          ) : (
            price?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0
          )}
        </ItemList>
        <ItemList label="ส่วนลด" info="คำนวณจากรายการสินค้า">
          {discount ? (
            <div className="font-medium text-green-600">
              -{" "}
              {discount.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </div>
          ) : (
            <div className="font-medium text-gray-600">0</div>
          )}
        </ItemList>
        <ItemList label="ต้นทุนเพิ่ม" info="คำนวณจากรายการสินค้า">
          {extraCost ? (
            <div className="font-medium text-red-600">
              +{" "}
              {extraCost.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </div>
          ) : (
            <div className="font-medium text-gray-600">0</div>
          )}
        </ItemList>
        <ItemList label="ราคาก่อนหักภาษี">
          <div className="font-medium text-gray-900">
            {priceBeforeVat?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </div>
        </ItemList>
        <ItemList label="7% Vat">
          <div className="font-medium text-yellow-600">
            {vat?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </div>
        </ItemList>
        {/* <ItemList label="หัก ณ ที่จ่าย 3%">
          <Input
            id="tax"
            {...register("tax")}
            step={0.01}
            type="number"
            className=" border border-gray-300 text-right px-2 text-xs focus:ring-0"
            defaultValue={0}
          />
        </ItemList> */}
        <ItemList label="ราคาทั้งหมด (ไม่รวม หัก ณ ที่จ่าย)">
          <div className="font-medium text-primary-600 flex items-center space-x-2">
            <span>
              {" "}
              {grandTotal?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0}
            </span>
          </div>
        </ItemList>

        <div className="col-span-12 h-[30px]">
          {isDirty && (
            <div className="flex justify-center space-x-3 px-2 ">
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
        </div>
      </div>
    </form>
  );
}

const ItemList = ({
  label,
  info,
  children,
}: {
  label?: string;
  info?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="col-span-12 pt-2">
      <div className=" flex justify-between items-center px-6 h-full">
        <div className="flex space-x-2 items-center">
          {label && (
            <p className="text-sm leading-6 text-gray-600 max-w-[150px] whitespace-nowrap">
              {label}
            </p>
          )}
          {info && <HoverInfo message={info} />}
        </div>
        <div className="w-[220px] flex justify-end items-center">
          {children}
        </div>
      </div>
    </div>
  );
};

const HoverInfo = ({ message }: { message: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="w-4 h-4 text-orange-500" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
