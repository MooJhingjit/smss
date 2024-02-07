'use client';
import React from "react";
import { Lock } from "lucide-react";
import { QuotationStatus, QuotationType } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
type Props = {
  type: QuotationType;
  status: QuotationStatus;
};

export default function QuotationTools(props: Props) {
  const { status, type } = props;
  return (
    <div className="space-y-2">
      <div className="flex space-x-3">
        <div className="inline-flex capitalize font-semibold items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
          <Lock className="w-3.5 h-3.5 mr-1" />
          <span>{type}</span>
        </div>
        <ItemStatus curStatus={status} />
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-3 bg-gray-200 w-full mb-2"></div>
      ))}
      {/* <Item label="Status" value="Draft" />
      <Item label="Status" value="Draft" />
      <Item label="Status" value="Draft" /> */}
    </div>
  );
}

const ItemStatus = ({ curStatus }: {
  curStatus: QuotationStatus
}
) => {
  const allStatus = Object.keys(QuotationStatus)
  return (
    <Select>
      <SelectTrigger className="inline-flex capitalize font-semibold items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
        <SelectValue placeholder={curStatus} />
      </SelectTrigger>
      <SelectContent className="bg-white text-xs p-2 space-y-2">
        {
          allStatus.map((status, index) => (
            <SelectItem value={status} key={index}>{status}</SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  )
}