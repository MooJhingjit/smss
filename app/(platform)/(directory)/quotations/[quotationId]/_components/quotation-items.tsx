"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { Input } from "@/components/ui/input";
export default function QuotationItems() {
  const [itemCount, setItemCount] = useState(1);

  return (
    <PageComponentWrapper headerTitle="Quotation Items">
      <div className="overflow-x-scroll md:overflow-auto">
        <table className="w-full text-gray-500 ">
          <thead className="text-left text-sm text-gray-500 ">
            <tr>
              <th scope="col" className="w-10">
                #
              </th>
              <th
                scope="col"
                className="py-3 pr-8 text-xs sm:w-2/5 lg:w-1/2 font-normal"
              >
                Product
              </th>

              <th scope="col" className=" w-1/12 py-3 pr-8 text-xs font-normal">
                Unit
              </th>
              <th scope="col" className=" w-1/8 py-3 pr-8 text-xs font-normal">
                Price
              </th>
              <th scope="col" className=" w-1/8 py-3 pr-8 text-xs font-normal">
                Percent/Cost
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
                  <Input id="unit" type="number" className="w-14" />
                </td>
                <td className="pr-2">
                  <Input id="price" />
                </td>
                <td>
                  <div className="flex space-x-2">
                    <div className="relative rounded-md shadow-sm">
                      <Input name="percent" className="bg-gray-100" />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span
                          className="text-gray-500 sm:text-sm"
                          id="price-currency"
                        >
                          %
                        </span>
                      </div>
                    </div>
                    <Input id="cost" className="bg-gray-100" />
                  </div>
                </td>
                <td>??????</td>
                <td>
                  <Trash2
                    onClick={() => setItemCount(itemCount - 1)}
                    className="w-4 h-4 text-red-300 cursor-pointer hover:text-red-700"
                  />
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
    <textarea
      className="w-full h-full border p-2 rounded-lg"
      placeholder="Remarks"
    ></textarea>
  );
};
