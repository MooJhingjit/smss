'use client';
import React from "react";
import { LockIcon, ChevronDown, CheckIcon, ChevronDownIcon, ChevronUpIcon, PrinterIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";

type Props = {
  quotationId: number;
  type: QuotationType;
  status: QuotationStatus;
  isLocked: boolean;
};

export default function QuotationTools(props: Props) {
  const { quotationId, status, isLocked } = props;

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
      toast.success("สำเร็จ");
    },
  });

  const handleItemChange = (status: QuotationStatus) => {
    mutate({ status })
  }


  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-3 ">
        {/* <div className="inline-flex capitalize font-semibold rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
          <span>{type}</span>
        </div> */}
        {
          isLocked && (
            <div className="col-span-1 flex items-center">
              <LockIcon className="w-6 h-6 text-yellow-500" />
            </div>
          )
        }
        <div className="col-span-5">
          <ItemStatus
            onStatusChange={handleItemChange}
            curStatus={status} />
        </div>
        <div className="col-span-4">
          <PrintButton />
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
      <SelectTrigger className="inline-flex capitalize font-semibold  rounded-md bg-yellow-50 px-2 py-1 text-xs text-yellow-700 border border-yellow-500 items-center">
        <SelectValue placeholder={
          "สถานะปัจจุบัน: " + quotationStatusMapping[curStatus]
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


const PrintButton = () => {
  return (
    <Button
      variant="outline"
      className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs h-full"
    >
      <PrinterIcon className="w-4 h-4 mr-1" />
      <span>พิมพ์ใบเสนอราคา</span>
    </Button>
  )
}

