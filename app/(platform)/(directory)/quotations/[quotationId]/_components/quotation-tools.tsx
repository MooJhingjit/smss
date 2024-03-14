"use client";
import React from "react";
import {
  LockIcon,
  ChevronDown,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PrinterIcon,
} from "lucide-react";
import { QuotationStatus, QuotationType } from "@prisma/client";
// import * as Select from '@radix-ui/react-select';
import { quotationStatusMapping } from "@/app/config";
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
import { FormInput } from "@/components/form/form-input";

type Props = {
  purchaseOrderRef: string;
  quotationId: number;
  type: QuotationType;
  status: QuotationStatus;
  isLocked: boolean;
};

export default function QuotationTools(props: Props) {
  const { purchaseOrderRef, quotationId, status, isLocked } = props;

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    {
      purchaseOrderRef?: string;
      status: QuotationStatus;
    }
  >({
    mutationFn: async (fields) => {
      const res = await QT_SERVICES.put(quotationId, {
        ...fields,
      });
      return res;
    },
    onSuccess: async (n) => {
      toast.success("สำเร็จ");
    },
  });

  const handleItemChange = (payload: {
    status?: QuotationStatus;
    purchaseOrderRef?: string;
  }) => {
    console.log("payload", payload)
    mutate({
      status: payload.status ?? status,
      purchaseOrderRef: payload.purchaseOrderRef ?? purchaseOrderRef,
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-3 ">
        {/* <div className="inline-flex capitalize font-semibold rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
          <span>{type}</span>
        </div> */}

        <div className="col-span-6">
          <ItemStatus onStatusChange={(s) => {
            handleItemChange({ status: s });
          }} curStatus={status} />
        </div>
        <div className="col-span-5"></div>
        <div className="col-span-1 flex items-center">
          {isLocked && <LockIcon className="w-6 h-6 text-yellow-500" />}
        </div>
        <div className="col-span-4 flex items-center">
          <PurchaseOrderRefInput
            defaultValue={purchaseOrderRef}
            onUpdate={handleItemChange}
          />
        </div>
        <div className="col-span-5 flex  items-end">
          <div className="h-[36px]">
            <PrintButton />
          </div>
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

const ItemStatus = ({
  curStatus,
  onStatusChange,
}: {
  curStatus: QuotationStatus;
  onStatusChange: (status: QuotationStatus) => void;
}) => {
  const allStatus = Object.keys(QuotationStatus) as QuotationStatus[];

  return (
    <Select onValueChange={onStatusChange}>
      <SelectTrigger className="inline-flex capitalize font-semibold  rounded-md bg-yellow-50 px-2 py-1 text-xs text-yellow-700 border border-yellow-500 items-center">
        <SelectValue
          placeholder={"สถานะปัจจุบัน: " + quotationStatusMapping[curStatus].label}
        />
      </SelectTrigger>
      <SelectContent className="bg-white text-xs p-2 space-y-2 ">
        {allStatus.map((status, index) => (
          <SelectItem value={status} key={index}>
            {quotationStatusMapping[status].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const PrintButton = () => {
  return (
    <Button
      variant="outline"
      className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs h-full"
    >
      <PrinterIcon className="w-4 h-4 mr-1" />
      <span>พิมพ์ใบเสนอราคา</span>
    </Button>
  );
};


const PurchaseOrderRefInput = ({ onUpdate, defaultValue }: {
  onUpdate: (payload: { purchaseOrderRef: string, }) => void;
  defaultValue: string;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <FormInput
      id="Ref_PO"
      label="อ้างอิงใบสั่งซื้อ"
      ref={inputRef}
      className="text-xs w-full"
      placeholder="PO-xxxxxx"
      defaultValue={defaultValue}
      onBlur={() => {
        // get current value
        const purchaseOrderRef = inputRef.current?.value || "";

        // check if value is different from default
        if (purchaseOrderRef === defaultValue) return;

        onUpdate({ purchaseOrderRef });
      }}
    />
  )
}