"use client";
import React from "react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { Input } from "@/components/ui/input";
import { PurchaseOrderWithRelations } from "@/types";
import { PurchaseOrderItem } from "@prisma/client";
import TableLists from "@/components/table-lists";

const columns = [
  { name: "No.", key: "index" },
  {
    name: "name", key: "name",
    render: (item: PurchaseOrderItem) => {
      return item.name;
    },
  },
  { name: "Price", key: "price" },
  { name: "Quantity", key: "quantity" },
  { name: "Status", key: "status" },
];

export default function QuotationItems({ data }: { data: PurchaseOrderWithRelations }) {
  const { purchaseOrderItems } = data;
  if (!purchaseOrderItems) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-sm">Data not found</p>
      </div>
    );
  }

  return (
    <PageComponentWrapper headerTitle="Quotation Items">
      <div className="overflow-x-scroll md:overflow-auto">
        <TableLists<PurchaseOrderItem>
          columns={columns}
          data={purchaseOrderItems}
        />
      </div>
      {data && (
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="col-span-5 md:col-span-3 ">
            <Remarks />
          </div>
          <div className="col-span-5 md:col-span-2">
            <BillingInfo data={data} />
          </div>
        </div>
      )}
    </PageComponentWrapper>
  );
}

const BillingInfo = ({ data }: { data: PurchaseOrderWithRelations }) => {
  return (
    <div className="bg-gray-100 p-4 w-full sm:rounded-lg sm:px-6">
      <dl className="divide-y divide-gray-200 text-sm">

        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">Discount</dt>
          <dd className="font-medium text-gray-900">
            {data.totalDiscount?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">7% Vat</dt>
          <dd className="font-medium text-gray-900">
            {data.totalTax?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </dd>
        </div>
        <div className="flex items-center justify-between pt-4">
          <dt className="font-medium text-gray-900">Grand Total</dt>
          <dd className="font-medium text-primary-600">
            {data.totalPrice?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </dd>
        </div>
      </dl>
    </div>
  );
};

const Remarks = () => {
  return (
    <div className="space-y-4">
      <div className="w-full">
        <textarea
          className="w-full min-h-44 border p-2 rounded-lg"
          placeholder="Remarks"
        ></textarea>
      </div>
      <div className=" grid grid-cols-3 gap-2">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            ราคาก่อนหักภาษี
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <Input type="text" name="price" id="price" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm" id="price-currency">
                บาท
              </span>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            หัก ณ ที่จ่าย 3%
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <Input type="text" name="price" id="price" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm" id="price-currency">
                บาท
              </span>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            ราคาหลังจากหัก ณ ที่จ่าย
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <Input type="text" name="price" id="price" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm" id="price-currency">
                บาท
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
