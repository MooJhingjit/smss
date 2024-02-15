'use client';
import React from "react";
import { Lock, ChevronDown, CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { QuotationStatus, QuotationType } from "@prisma/client";
// import * as Select from '@radix-ui/react-select';
import { quotationStatusMapping } from "@/app/config";
import { classNames } from "@/lib/utils";
import { MutationResponseType } from "@/components/providers/query-provider";
import { useMutation } from "@tanstack/react-query";
import QT_SERVICES from "@/app/services/service.quotation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  quotationId: number;
  type: QuotationType;
  status: QuotationStatus;
};

export default function QuotationTools(props: Props) {
  const { quotationId, status, type } = props;

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    {
      status: QuotationStatus;
    }
  >({
    mutationFn: async (fields) => {
      const res = await QT_SERVICES.put(quotationId, {
        ...fields
      });
      return res
    },
    onSuccess: async (n) => {
      toast.success("Updated successfully");
    },
  });

  const handleItemChange = (status: QuotationStatus) => {
    mutate({ status })
  }


  return (
    <div className="space-y-2">
      <div className="flex space-x-3 justify-end">
        {/* <div className="inline-flex capitalize font-semibold rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
          <span>{type}</span>
        </div> */}
        <div className="w-[150px]">
          <ItemStatus
            onStatusChange={handleItemChange}
            curStatus={status} />
        </div>
      </div>
      {/* {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-3 bg-gray-200 w-full mb-2"></div>
      ))} */}
      {/* <Item label="Status" value="Draft" />
      <Item label="Status" value="Draft" />
      <Item label="Status" value="Draft" /> */}
    </div>
  );
}

const ItemStatus = ({ curStatus, onStatusChange }: {
  curStatus: QuotationStatus
  onStatusChange: (status: QuotationStatus) => void
}
) => {
  const allStatus = Object.keys(QuotationStatus) as QuotationStatus[]

  return (
    <Select onValueChange={onStatusChange}>
      <SelectTrigger className="inline-flex capitalize font-semibold  rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
        <SelectValue placeholder={
          quotationStatusMapping[curStatus]
        } />
      </SelectTrigger>
      <SelectContent className="bg-white text-xs p-2 space-y-2 ">
        {
          allStatus.map((status, index) => (
            <SelectItem value={status} key={index}>{
              quotationStatusMapping[status]
            }</SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  )
}



