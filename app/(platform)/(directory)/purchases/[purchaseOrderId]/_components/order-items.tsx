"use client";
import React, { useState } from "react";
import { Trash2, PackagePlus } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { Input } from "@/components/ui/input";
import { useItemModal } from "@/hooks/use-item-modal";
export default function QuotationItems() {
  const [itemCount, setItemCount] = useState(1);
  const modal = useItemModal();

  return (
    <PageComponentWrapper headerTitle="Quotation Items">
      <div className="overflow-x-scroll md:overflow-auto">
        <table className="w-full text-gray-500 ">
          <thead className="text-left text-sm text-gray-500 ">
            <tr>
              <th scope="col" className="w-10 text-xs font-normal">
                Code
              </th>
              <th
                scope="col"
                className="py-3 pr-8 text-xs sm:w-2/5 lg:w-1/2 font-normal"
              >
                Description
              </th>

              <th scope="col" className=" w-1/12 py-3 pr-8 text-xs font-normal">
                Quantity
              </th>
              <th scope="col" className=" w-1/8 py-3 pr-8 text-xs font-normal">
                Unit
              </th>
              <th scope="col" className=" w-1/8 py-3 pr-8 text-xs font-normal">
                Unit Price
              </th>
              <th scope="col" className=" w-1/12 py-3 pr-8 text-xs font-normal">
                Amount
              </th>

              <th scope="col" className="w-0 py-3 text-right text-xs"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
            {Array.from({ length: itemCount }).map((_, index) => (
              <tr className="border-b border-gray-200 ">
                <td className="py-6">{index + 1}</td>
                <td>
                  <Input id="product-name" />
                </td>
                <td>
                  <Input id="unit" type="number" className="w-20" />
                </td>
                <td>
                  <Input id="unit" type="number" className="w-20" />
                </td>

                <td>
                  <Input id="price" className="w-40" />
                </td>
                <td>???? </td>
                <td>
                  <div className="flex space-x-4 items-center">
                    <PackagePlus
                      onClick={() => modal.onOpen()}
                      className="w-4 h-4 text-green-500 cursor-pointer hover:text-green-700"
                    />
                    <Trash2
                      onClick={() => setItemCount(itemCount - 1)}
                      className="w-4 h-4 text-red-300 cursor-pointer hover:text-red-700"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {/* add button */}
            <tr className="border-b border-gray-200 ">
              <td className="py-2" colSpan={6}>
                <button
                  onClick={() => setItemCount(itemCount + 1)}
                  className="bg-gray-50 hover:text-gray-700  h-10 border border-gray-200 rounded w-full"
                >
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {itemCount > 0 && (
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="col-span-5 md:col-span-3 ">
            <Remarks />
          </div>
          <div className="col-span-5 md:col-span-2">
            <BillingInfo />
          </div>
        </div>
      )}
    </PageComponentWrapper>
  );
}

const BillingInfo = () => {
  return (
    <div className="bg-gray-100 p-4 w-full sm:rounded-lg sm:px-6">
      <dl className="divide-y divide-gray-200 text-sm">
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">Subtotal</dt>
          <dd className="font-medium text-gray-900">????</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">Discount</dt>
          <dd className="font-medium text-gray-900">????</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">Total</dt>
          <dd className="font-medium text-gray-900">????</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">7% Vat</dt>
          <dd className="font-medium text-gray-900">????</dd>
        </div>
        <div className="flex items-center justify-between pt-4">
          <dt className="font-medium text-gray-900">Grand Total</dt>
          <dd className="font-medium text-primary-600">????</dd>
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
