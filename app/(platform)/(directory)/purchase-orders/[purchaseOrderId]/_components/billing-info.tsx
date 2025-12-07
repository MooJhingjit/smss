import { PurchaseOrderWithRelations } from "@/types";
import React from "react";
import useBillingInfo from "./useBillingInfo";
import { Button } from "@/components/ui/button";
import { usePurchaseOrderSummaryModal } from "@/hooks/use-po-summary-modal";

export default function BillingInfo({
  isManual,
  data,
}: {
  isManual: boolean;
  data: PurchaseOrderWithRelations;
}) {
  const { discount, extraCost, price, vat, grandTotal, priceBeforeVat } =
    useBillingInfo({ data });
  const { onOpen } = usePurchaseOrderSummaryModal();

  return (
    <div className="bg-gray-100 px-4 py-2 w-full sm:rounded-lg sm:px-6">
      <dl className="divide-y divide-gray-200 text-sm">
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ราคา</dt>
          <dd className="font-medium text-gray-900">
            <p>
              {price?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0}
            </p>
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ส่วนลด</dt>
          {discount ? (
            <dd className="font-medium text-green-600">
              -{" "}
              {discount.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </dd>
          ) : (
            <dd className="font-medium text-gray-600">0</dd>
          )}
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ต้นทุนเพิ่ม</dt>
          {extraCost ? (
            <dd className="font-medium text-red-600">
              +{" "}
              {extraCost.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </dd>
          ) : (
            <dd className="font-medium text-gray-600">0</dd>
          )}
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ราคาก่อนหักภาษี</dt>
          <dd className="font-medium text-gray-900">
            <p>
              {priceBeforeVat?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0}
            </p>
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">7% Vat</dt>
          <dd className="font-medium text-yellow-600">
            <p>
              {vat?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0}
            </p>
          </dd>
        </div>
        {/* <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">หัก ณ ที่จ่าย 3%</dt>
          <dd className="font-medium text-yellow-600">
            {tax?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0}
          </dd>
        </div> */}
        <div className="flex items-center justify-between pt-4">
          <dt className="font-medium text-gray-900">
            ราคาทั้งหมด (ไม่รวม หัก ณ ที่จ่าย)
          </dt>

          <dd className="font-medium text-primary-600 flex items-center space-x-2">
            <Button
              onClick={() => {
                onOpen(data);
              }}
              size="sm"
              variant={"ghost"}
            >
              แก้ไข
            </Button>
            <span>
              {grandTotal?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
