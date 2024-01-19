"use client";
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { Input } from "@/components/ui/input";
import { QuotationItem, QuotationList } from "@prisma/client";
import TableLists from "@/components/table-lists";
import { useQuotationListModal } from "@/hooks/use-quotation-list";

type Props = {
  data: QuotationList[];
};
const columns = [
  { name: 'name', key: 'name' },
  { name: 'Price', key: 'price' },
  { name: 'Unit Price', key: 'unitPrice' },
  { name: 'Cost', key: 'cost' },
  { name: 'Percentage', key: 'percentage' },
  { name: 'Quantity', key: 'quantity' },
  {
    name: 'Updated', key: 'quantity',
    render: (item: QuotationList) => {
      const date = new Date(item.updatedAt);
      return date.toLocaleDateString('th-TH',);
    }
  },
  {
    name: '', key: 'actions',
    render: (item: QuotationList) => {
      return (
        <Trash2
          onClick={() => { }}
          className="w-4 h-4 text-red-300 cursor-pointer hover:text-red-700"
        />
      )
    }
  },
];

export default function QuotationLists(props: Props) {
  const { data } = props;
  console.log("data", data)
  const modal = useQuotationListModal();

  return (
    <PageComponentWrapper headerTitle="Quotation Items" headerIcon={<Plus
      onClick={() => modal.onOpen()}
      className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700"
    />}>
      <div className="overflow-x-scroll md:overflow-auto">
        <TableLists<QuotationList>
          columns={columns}
          data={data}
        // onManage={(item) => modal.onOpen(item, {
        //   productRef: { id: data.id, name: data.name },
        //   vendorRef: { id: data.vendor?.id, name: data.vendor?.name },
        // })}
        />

        {/* <table className="w-full text-gray-500 ">
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
            {data?.map((item, index) => (
              <ItemRow key={item.id} item={item} index={index} />
            ))}
            
          </tbody>
        </table> */}
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

const ItemRow = (props: { index: number, item: QuotationList }) => {
  const { index, item } = props;

  return (
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
          onClick={() => { }}
          className="w-4 h-4 text-red-300 cursor-pointer hover:text-red-700"
        />
      </td>
    </tr>
  )
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
