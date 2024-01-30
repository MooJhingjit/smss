"use client";
import React from "react";
import { Plus, FileEdit } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { usePurchaseModal } from "@/hooks/use-po-modal";

export default function AssociateOrders() {
  return (
    <PageComponentWrapper
      headerIcon={
        <Plus
          onClick={usePurchaseModal().onOpen}
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700"
        />
      }
      headerTitle="รายการสั่งซื้ออื่นๆ สำหรับ QT-0001"
    >
      <div className="overflow-x-scroll">
        <table className="w-full text-gray-500">
          <caption className="sr-only">Products</caption>
          <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
            <tr>
              <th scope="col" className="w-1/12">
                #
              </th>
              <th
                scope="col"
                className="py-3 pr-8 text-xs sm:w-2/5 lg:w-1/12 font-normal"
              >
                Vendor
              </th>
              <th scope="col" className="w-1/12 py-3 pr-8 text-xs font-normal">
                Unit
              </th>
              <th scope="col" className="w-1/12 py-3 pr-8 text-xs font-normal">
                Amount
              </th>
              <th scope="col" className="w-1/12 py-3 pr-8 text-xs font-normal">
                Created At
              </th>
              <th className="w-1/12 "></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
            {Array.from({ length: 2 }).map((_, index) => (
              <tr className="border-b border-gray-200 ">
                <td className="py-6">{index + 1}</td>
                <td>?????</td>
                <td>????</td>
                <td>?????</td>
                <td>?????</td>
                <td>
                  <div className="flex space-x-2 items-center">
                    <span className="inline-flex font-semibold items-center rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                      Draft
                    </span>
                    <FileEdit className="w-4 h-4 text-orange-400 cursor-pointer hover:text-orange-700" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageComponentWrapper>
  );
}
