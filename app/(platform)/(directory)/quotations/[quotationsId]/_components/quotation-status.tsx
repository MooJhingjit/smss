import React from "react";
import { Lock } from "lucide-react";

export default function QuotationStatus() {
  return (
    <div className="space-y-2">
      <div className="flex space-x-3">
        <span className="inline-flex font-semibold items-center rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
          Draft
        </span>
        <span className="inline-flex font-semibold items-center rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700">
          Service
        </span>
        <span className="inline-flex font-semibold items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
          <Lock className="w-4 h-4 text-red-" />
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
