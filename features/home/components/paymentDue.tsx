"use client";
import React from "react";
import CardWrapper from "./card-wrapper";
import TableLists from "@/components/table-lists";
import { QuotationWithBuyer } from "@/types";
import {
  purchaseOrderStatusMapping,
  quotationStatusMapping,
} from "@/app/config";
import { PurchaseOrderWithVendor } from "../admin.page";
import StatusBadge from "@/components/badges/status-badge";

type Props<T> = {
  data: T[];
  label: string;
  type: "quotations" | "purchase-orders";
};

const QT_columns = [
  { name: "รหัส", key: "code" },
  {
    name: "ลูกค้า",
    key: "buyer.name",
    render: (item: QuotationWithBuyer) => {
      return <div className="">{item.contact.name}</div>;
    },
  },
  {
    name: "กำหนดชำระ",
    key: "paymentDue",
    render: (item: QuotationWithBuyer) => {
      const isLate = new Date(item.paymentDue ?? "") < new Date();

      return (
        <p className={isLate ? "text-red-500" : "text-yellow-500"}>
          {new Date(item.paymentDue ?? "").toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      );
    },
  },
  {
    name: "สถานะ",
    key: "status",
    render: (item: QuotationWithBuyer) => {
      return <StatusBadge status={quotationStatusMapping[item.status].label} />;
    },
  },
];
const PO_columns = [
  { name: "รหัส", key: "code" },
  {
    name: "ร้านค้า",
    key: "vendor.name",
    render: (item: PurchaseOrderWithVendor) => {
      return <div className="">{item.vendor.name}</div>;
    },
  },
  {
    name: "กำหนดชำระ",
    key: "paymentDue",
    render: (item: PurchaseOrderWithVendor) => {
      const isLate = new Date(item.paymentDue ?? "") < new Date();

      return (
        <p className={isLate ? "text-red-500" : "text-yellow-500"}>
          {new Date(item.paymentDue ?? "").toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      );
    },
  },
  {
    name: "สถานะ",
    key: "status",
    render: (item: PurchaseOrderWithVendor) => {
      return <StatusBadge status={purchaseOrderStatusMapping[item.status]} />;
    },
  },
];
export default function PaymentDue<T>(props: Readonly<Props<T>>) {
  const { data, label, type } = props;

  if (type === "quotations") {
    return (
      <CardWrapper title={label} actionNeed>
        <TableLists<QuotationWithBuyer>
          columns={QT_columns}
          data={data as QuotationWithBuyer[]}
          link={`/${type}`}
        />
      </CardWrapper>
    );
  }

  return (
    <CardWrapper title={label} actionNeed>
      <TableLists<PurchaseOrderWithVendor>
        columns={PO_columns}
        data={data as PurchaseOrderWithVendor[]}
        link={`/${type}`}
      />
    </CardWrapper>
  );
}
