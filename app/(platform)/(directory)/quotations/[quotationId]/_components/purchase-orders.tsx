"use client";
import React, { useEffect, useState } from "react";
import { Plus, FileEdit } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { usePurchaseModal } from "@/hooks/use-po-modal";
import { PurchaseOrder } from "@prisma/client";
import PURCHASE_ORDER_SERVICES from "@/app/services/service.purchase-order";
import { PurchaseOrderWithRelations } from "@/types";

const itemCount = 0;
type Props = {
  quotationId: number;
};
export default function PurchaseOrders(props: Props) {
  const { quotationId } = props;
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderWithRelations[]>([]);

  useEffect(() => {
    // get purchase orders
    const getPurchaseOrders = async () => {
      const res = await PURCHASE_ORDER_SERVICES.get({
        quotationId
      });

      setPurchaseOrders(res)
    }

    getPurchaseOrders()
  }, [])

  const generatePurchaseOrder = async () => {
    const res = await PURCHASE_ORDER_SERVICES.generatePOs({
      quotationId
    });

    setPurchaseOrders(res)
  };

  const renderActionButtons = () => {
    if (purchaseOrders?.length === 0) {
      return (
        <button
          onClick={generatePurchaseOrder}

          className="flex items-center justify-center  bg-gray-50 hover:text-gray-700 border border-gray-300 rounded text-xs px-4 py-0.5">
          Generate
        </button>
      );
    }
    return (
      <Plus
        // onClick={usePurchaseModal().onOpen}
        className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700"
      />
    );
  };

  return (
    <PageComponentWrapper
      headerIcon={renderActionButtons()}
      headerTitle="Purchase Orders"
    >
      {
        !!purchaseOrders.length && (
          <table className="w-full text-gray-500">
            <caption className="sr-only">Products</caption>
            <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
              <tr>
                <th scope="col" className="w-1/12">
                  Code
                </th>
                <th
                  scope="col"
                  className="py-3 pr-8 text-xs sm:w-2/5 lg:w-1/12 font-normal"
                >
                  Vendor
                </th>
                <th scope="col" className="w-1/12 py-3 pr-8 text-xs font-normal">
                  Total Price
                </th>
                <th scope="col" className="w-1/12 py-3 pr-8 text-xs font-normal">
                  Total Discount
                </th>
                <th scope="col" className="w-1/12 py-3 pr-8 text-xs font-normal">
                  Created At
                </th>
                <th className="w-1/12 "></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
              {purchaseOrders.map((po, index) => (
                <tr className="border-b border-gray-200 " key={po.id}>
                  <td className="py-3">{po.code}</td>
                  <td>{po.vendor?.name}</td>
                  <td>{po.totalPrice}</td>
                  <td>{po.totalDiscount}</td>
                  <td>{
                    new Date(po.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }</td>
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
        )
      }
    </PageComponentWrapper>
  );
}
