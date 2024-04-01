import React from "react";
import { PurchaseOrderStatus, Quotation } from "@prisma/client";
import Link from "next/link";

type Props = {
  quotation: Quotation;
  status: PurchaseOrderStatus;
};
export default function OrderStatus(props: Readonly<Props>) {
  const { status, quotation } = props;
  return (
    <div className="space-y-2">
      <div className="flex space-x-3">
        <span className=" capitalize inline-flex font-semibold items-center rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
          {status}
        </span>
        <Link
          href={`/quotations/${quotation.id}`}
          target="_blank"
          className="inline-flex font-semibold items-center rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 underline cursor-pointer"
        >
          {quotation.code}
        </Link>
      </div>
    </div>
  );
}

const Item = (props: { label: string; value: string }) => {
  const { label, value } = props;
  return (
    <div className="flex space-x-2">
      <p className="">{label}:</p>
      <p>{value}</p>
    </div>
  );
};
