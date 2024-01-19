import React from "react";
import { Lock } from "lucide-react";
import { QuotationType } from "@prisma/client";

type Props = {
  type: QuotationType;
  status: string;
};

export default function QuotationStatus(props: Props) {
  const { status, type } = props;
  return (
    <div className="space-y-2">
      <div className="flex space-x-3">
        <div className="inline-flex capitalize font-semibold items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
          <Lock className="w-3.5 h-3.5 mr-1" />
          <span>{type}</span>
        </div>
        <span className="inline-flex capitalize font-semibold items-center rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
          {status}
        </span>
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="h-3 bg-gray-200 w-full mb-2"></div>
      ))}
      {/* <Item label="Status" value="Draft" />
      <Item label="Status" value="Draft" />
      <Item label="Status" value="Draft" /> */}
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
