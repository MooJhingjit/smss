'use client';
import React from "react";
import { LockIcon, ChevronDown, CheckIcon, ChevronDownIcon, ChevronUpIcon, PrinterIcon } from "lucide-react";
import { PurchaseOrderStatus, QuotationStatus, QuotationType } from "@prisma/client";
// import * as Select from '@radix-ui/react-select';
import { purchaseOrderStatusMapping, quotationStatusMapping } from "@/app/config";
// import { classNames } from "@/lib/utils";
// import { MutationResponseType } from "@/components/providers/query-provider";
// import { useMutation } from "@tanstack/react-query";
// import QT_SERVICES from "@/app/services/service.quotation";
// import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  orderId: number;
  quotationId: number;
  quotationCode: string;
  status: PurchaseOrderStatus;
  isLocked?: boolean;
};

export default function PurchaseOrderTools(props: Props) {
  const { orderId, quotationId, quotationCode, status, isLocked } = props;

  // const { mutate } = useMutation<
  //   MutationResponseType,
  //   Error,
  //   {
  //     status: QuotationStatus;
  //   }
  // >({
  //   mutationFn: async (fields) => {
  //     const res = await QT_SERVICES.put(quotationCode, {
  //       ...fields
  //     });
  //     return res
  //   },
  //   onSuccess: async (n) => {
  //     toast.success("สำเร็จ");
  //   },
  // });

  const handleItemChange = (status: PurchaseOrderStatus) => {
    // mutate({ status })
  }


  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-3 ">
        {/* <div className="inline-flex capitalize font-semibold rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
          <span>{type}</span>
        </div> */}
        {
          isLocked && (
            <div className="col-span-2 flex items-center">
              <LockIcon className="w-6 h-6 text-yellow-500" />
            </div>
          )
        }
        <div className="col-span-5">
          <ItemStatus
            onStatusChange={handleItemChange}
            curStatus={status} />
        </div>
        <div className="col-span-3">
          <PrintButton />
        </div>
        <div className="col-span-6 flex items-center space-x-1">
          <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">จากใบเสนอราคา

            <Link
              href={`/quotations/${quotationId}`}
              className="ml-1.5 text-blue-500 underline"
            >
              {quotationCode}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

const ItemStatus = ({ curStatus, onStatusChange }: {
  curStatus: PurchaseOrderStatus
  onStatusChange: (status: PurchaseOrderStatus) => void
}
) => {
  const allStatus = Object.keys(PurchaseOrderStatus) as PurchaseOrderStatus[]

  return (
    <Select onValueChange={onStatusChange}>
      <SelectTrigger className="inline-flex capitalize font-semibold  rounded-md bg-yellow-50 px-2 py-1 text-xs text-yellow-700 border border-yellow-500 items-center">
        <SelectValue placeholder={
          "อยู่ในสถานะ การ" + purchaseOrderStatusMapping[curStatus]
        } />
      </SelectTrigger>
      <SelectContent className="bg-white text-xs p-2 space-y-2 ">
        {
          allStatus.map((status, index) => (
            <SelectItem value={status} key={index}>{
              purchaseOrderStatusMapping[status]
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
      <span>พิมพ์ใบสั่งซื้อ</span>
    </Button>
  )
}

