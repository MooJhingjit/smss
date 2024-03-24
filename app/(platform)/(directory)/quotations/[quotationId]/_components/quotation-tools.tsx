"use client";
import React from "react";
import {
  LockIcon,
  ChevronDown,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PrinterIcon,
  Send,
  Clock,
  Check,
  CheckCircle,
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
import { customRevalidatePath } from "@/actions/revalidateTag";

type Props = {
  purchaseOrderRef: string;
  quotationId: number;
  type: QuotationType;
  status: QuotationStatus;
  isLocked: boolean;
  isAdmin: boolean;
  hasList: boolean;
};

export default function QuotationTools(props: Props) {
  const { hasList, purchaseOrderRef, quotationId, status, isLocked, isAdmin } =
    props;

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
      // invalidate query
      customRevalidatePath(`/quotations/${quotationId}`)
      

    },
  });

  const handleItemChange = (payload: {
    status?: QuotationStatus;
    purchaseOrderRef?: string;
  }) => {
    console.log("payload", payload);
    mutate({
      status: payload.status ?? status,
      purchaseOrderRef: payload.purchaseOrderRef ?? purchaseOrderRef,
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-5 ">
        {/* <div className="inline-flex capitalize font-semibold rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
          <span>{type}</span>
        </div> */}

        {isAdmin && (
          <>
            <div className="col-span-6">
              <ItemStatus
                onStatusChange={(s) => {
                  handleItemChange({ status: s });
                }}
                curStatus={status}
              />
            </div>
            <div className="col-span-5"></div>
          </>
        )}

        {isLocked && (
          <div className="col-span-1 flex items-center">
            <LockIcon className="w-6 h-6 text-yellow-500" />
          </div>
        )}

        <div className="col-span-6 flex items-center">
          <PurchaseOrderRefInput
            defaultValue={purchaseOrderRef}
            onUpdate={handleItemChange}
          />
        </div>
        <div className="col-span-12 grid grid-cols-4 md:grid-cols-6 ">
          <div className="col-span-2 ">
            <PrintButton hasList={hasList} />
          </div>
          {!isAdmin && (
            <div className="col-span-4 ">
              <QuotationApprovalButton
                hasList={hasList}
                currentStatus={status}
                onApprove={(s) => {
                  handleItemChange({
                    status: s,
                  });
                }}
              />
            </div>
          )}

          {/* <div className="col-span-6">
            <p className="text-xs text-yellow-700 p-2">
              ต้องเพิ่มรายการสินค้า
            </p>
          </div> */}
        </div>
      </div>
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
        <SelectValue placeholder={quotationStatusMapping[curStatus].label} />
      </SelectTrigger>
      <SelectContent className="bg-white text-xs p-2 space-y-2 ">
        {allStatus.map((status, index) => (
          <SelectItem value={status} key={index}
            className={
              status === curStatus
                ? "bg-yellow-100 text-yellow-700"
                : "text-gray-700"
            }
          >
            {quotationStatusMapping[status].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const QuotationApprovalButton = ({
  hasList,
  onApprove,
  currentStatus,
}: {
  hasList: boolean;
  onApprove: (status: QuotationStatus) => void;
  currentStatus: QuotationStatus;
}) => {
  console.log("🚀 ~ currentStatus:", currentStatus);
  if (currentStatus === QuotationStatus.open) {
    return (
      <Button
        variant="default"
        disabled={!hasList}
        onClick={() => {
          onApprove(QuotationStatus.pending_approval);
        }}
        className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
      >
        <Send className="w-4 h-4 mr-1" />
        <span>ส่งอนุมัติ</span>
      </Button>
    );
  } else if (currentStatus === QuotationStatus.pending_approval) {
    return (
      <div className="flex items-center h-full">
        <Clock className="w-4 h-4 mr-1 text-yellow-700" />
        <p className="text-sm text-yellow-700 ">รอการอนุมัติ</p>
      </div>
    );
  } else if (currentStatus === QuotationStatus.offer) {
    return (
      <div className="flex items-start space-x-1 h-full">
        <CheckCircle className="w-4 h-4 mr-1  text-green-700" />
        <div className="">
          <p className="text-sm text-green-700 ">
            ได้รับการอนุมัติ: สามารถนำส่งให้ลูกค้าได้
          </p>
          <p
            className="text-xs text-orange-400 hover:text-orange-500 underline mt-1 cursor-pointer "
            onClick={() => {
              onApprove(QuotationStatus.approved);
            }}
          >
            ยืนยันการอนุมัติจากลูกค้า
          </p>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
      {quotationStatusMapping[currentStatus].label}
    </span>
  );
};

const PrintButton = ({ hasList }: { hasList: boolean }) => {
  return (
    <Button
      disabled={!hasList}
      variant="outline"
      className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs h-full"
    >
      <PrinterIcon className="w-4 h-4 mr-1" />
      <span>พิมพ์ใบเสนอราคา</span>
    </Button>
  );
};

const PurchaseOrderRefInput = ({
  onUpdate,
  defaultValue,
}: {
  onUpdate: (payload: { purchaseOrderRef: string }) => void;
  defaultValue: string;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <FormInput
      id="Ref_PO"
      label=""
      ref={inputRef}
      className="text-xs w-full"
      placeholder="อ้างอิงใบสั่งซื้อ PO-xxxxxx"
      defaultValue={defaultValue}
      onBlur={() => {
        // get current value
        const purchaseOrderRef = inputRef.current?.value || "";

        // check if value is different from default
        if (purchaseOrderRef === defaultValue) return;

        onUpdate({ purchaseOrderRef });
      }}
    />
  );
};
