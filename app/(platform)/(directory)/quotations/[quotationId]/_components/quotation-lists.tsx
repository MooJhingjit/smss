"use client";
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { Input } from "@/components/ui/input";
import { QuotationItem, QuotationList } from "@prisma/client";
import TableLists from "@/components/table-lists";
import { useQuotationListModal } from "@/hooks/use-quotation-list";
import { QuotationListWithRelations } from "@/types";

type Props = {
  quotationId: number;
  data: QuotationListWithRelations[];
};
const columns = [
  { name: "name", key: "name" },
  { name: "Price", key: "price" },
  { name: "Unit Price", key: "unitPrice" },
  { name: "Cost", key: "cost" },
  { name: "Percentage", key: "percentage" },
  { name: "Quantity", key: "quantity" },
  {
    name: "Updated",
    key: "quantity",
    render: (item: QuotationListWithRelations) => {
      const date = new Date(item.updatedAt);
      return date.toLocaleDateString("th-TH");
    },
  },
];

export default function QuotationLists(props: Props) {
  const { data, quotationId } = props;
  const modal = useQuotationListModal();

  return (
    <PageComponentWrapper
      headerTitle="Quotation Items"
      headerIcon={
        <Plus
          onClick={() =>
            modal.onOpen(undefined, {
              quotationRef: { id: quotationId },
            })
          }
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700"
        />
      }
    >
      <div className="overflow-x-scroll md:overflow-auto">
        <TableLists<QuotationListWithRelations>
          columns={columns}
          data={data}
          onManage={(item) =>
            modal.onOpen(item, {
              quotationRef: { id: item.quotationId },
              productRef: { id: item.productId, name: item.product.name },
            })
          }
        />
      </div>
      {data.length > 0 && (
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
