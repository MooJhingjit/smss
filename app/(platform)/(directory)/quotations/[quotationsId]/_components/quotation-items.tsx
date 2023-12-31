import React from "react";
import { Trash2 } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";

export default function QuotationItems() {
  return (
    <PageComponentWrapper
      headerTitle="Quotation Items"
    >
      <table className="w-full text-gray-500 ">
        <caption className="sr-only">Products</caption>
        <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
          <tr>
            <th scope="col" className="w-1/12">
              #
            </th>
            <th scope="col" className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/2">
              Product
            </th>

            <th
              scope="col"
              className="hidden w-1/12 py-3 pr-8 font-normal sm:table-cell"
            >
              Unit
            </th>
            <th
              scope="col"
              className="hidden w-1/8 py-3 pr-8 font-normal sm:table-cell"
            >
              Unit Price
            </th>
            <th
              scope="col"
              className="hidden w-1/12 py-3 pr-8 font-normal sm:table-cell"
            >
              Amount
            </th>

            <th scope="col" className="w-0 py-3 text-right font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr className="border-b border-gray-200 ">
              <td className="py-6">{index + 1}</td>
              <td>?????</td>
              <td>?????</td>
              <td>?????</td>
              <td>??????</td>
              <td>
                <Trash2 className="w-4 h-4 text-red-300 cursor-pointer hover:text-red-700" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageComponentWrapper>
  );
}
