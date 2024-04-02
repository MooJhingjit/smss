"use client";
import React from "react";
import { LockIcon, PrinterIcon } from "lucide-react";
import { PurchaseOrderPaymentType, PurchaseOrderStatus, QuotationStatus } from "@prisma/client";
// import * as Select from '@radix-ui/react-select';
import { purchaseOrderStatusMapping } from "@/app/config";
import { MutationResponseType } from "@/components/providers/query-provider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { customRevalidatePath } from "@/actions/revalidateTag";
import PO_SERVICES from "@/app/services/service.purchase-order";
import PaymentOptionControl from "@/components/payment-option-control";
import { QuotationStatusDropdown } from "../../../quotations/[quotationId]/_components/quotation-tools";

type Props = {
  orderId: number;
  quotationId: number | null;
  quotationCode: string | null;
  status: PurchaseOrderStatus;
  isLocked?: boolean;
  paymentType: PurchaseOrderPaymentType;
  paymentDue: string;
  quotationStatus: QuotationStatus | undefined
};

export default function PurchaseOrderTools(props: Props) {
  const {
    orderId,
    quotationId,
    quotationCode,
    status,
    isLocked,
    paymentDue,
    paymentType,
    quotationStatus
  } = props;

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    {
      status?: PurchaseOrderStatus;
      paymentDue?: string;
      paymentType?: PurchaseOrderPaymentType;
    }
  >({
    mutationFn: async (fields) => {
      const res = await PO_SERVICES.put(orderId, {
        ...fields,
      });
      return res;
    },
    onSuccess: async (n) => {
      toast.success("สำเร็จ");
      // invalidate query
      customRevalidatePath(`/purchase-orders/${orderId}`);
    },
  });

  const handleChange = (payload: {
    status?: PurchaseOrderStatus;
    paymentDue?: string;
    paymentType?: PurchaseOrderPaymentType;
  }) => {
    // update what is provided
    let payloadBody: any = {};
    if (payload.status) {
      payloadBody["status"] = payload.status;
    }
    if (payload.paymentDue || payload.paymentDue === "") {
      payloadBody["paymentDue"] = payload.paymentDue
        ? new Date(payload.paymentDue).toISOString()
        : null;
    }

    if (payload.paymentType) {
      payloadBody["paymentType"] = payload.paymentType;
    }

    // call mutation
    mutate(payloadBody);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 divide-y divide-gray-100 gap-2 ">
        {/* <div className="inline-flex capitalize font-semibold rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 items-center">
          <span>{type}</span>
        </div> */}
        <ItemList label="สถานะ (PO)">
          <div className=" text-sm leading-6 text-gray-700 flex space-x-2">
            {isLocked && (
              <div className="col-span-1 flex items-center">
                <LockIcon className="w-4 h-4 text-yellow-500" />
              </div>
            )}
            <div className="">
              <ItemStatus
                onStatusChange={(s) => {
                  handleChange({ status: s });
                }}
                curStatus={status}
              />
            </div>
          </div>
        </ItemList>

        {
          quotationStatus && (
            <ItemList label="สถานะ (QT)">
              <div className=" text-sm leading-6 text-gray-700 flex space-x-2">
                {/* {isLocked && (
                  <div className="col-span-1 flex items-center">
                    <LockIcon className="w-4 h-4 text-yellow-500" />
                  </div>
                )} */}
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/quotations/${quotationId}`}
                    className="ml-1.5 text-yellow-600 underline whitespace-nowrap"
                  >
                    {quotationCode}
                  </Link>
                  <QuotationStatusDropdown
                    onStatusChange={(s) => {
                      // handleChange({ status: s });
                    }}
                    curStatus={quotationStatus}
                  />
                </div>
              </div>
            </ItemList>
          )
        }

        <ItemList label="การชำระเงิน">
          <PaymentOptionControl
            onUpdate={handleChange}
            paymentType={paymentType}
            paymentDue={paymentDue}
          />
        </ItemList>

        <ItemList>
          <div className="space-x-3 flex items-center">
            {/* {quotationId && (
              <div className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                <span>QT:</span>
                <Link
                  href={`/quotations/${quotationId}`}
                  className="ml-1.5 text-blue-500 underline"
                >
                  {quotationCode}
                </Link>
              </div>
            )} */}
            <PrintButton />
          </div>
        </ItemList>
      </div>
    </div>
  );
}

const ItemStatus = ({
  curStatus,
  onStatusChange,
}: {
  curStatus: PurchaseOrderStatus;
  onStatusChange: (status: PurchaseOrderStatus) => void;
}) => {
  const allStatus = Object.keys(PurchaseOrderStatus) as PurchaseOrderStatus[];

  return (
    <Select onValueChange={onStatusChange}>
      <SelectTrigger className="inline-flex capitalize font-semibold  rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 border border-blue-500 items-center">
        <SelectValue placeholder={purchaseOrderStatusMapping[curStatus]} />
      </SelectTrigger>
      <SelectContent className="bg-white text-xs p-2 space-y-2 ">
        {allStatus.map((status, index) => (
          <SelectItem value={status} key={index}>
            {purchaseOrderStatusMapping[status]}
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
      <span>พิมพ์ใบสั่งซื้อ</span>
    </Button>
  );
};

const ItemList = ({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="col-span-12 pt-2">
      <div className=" flex justify-between items-center">
        {label && <p className="text-sm leading-6 text-gray-600">{label}</p>}
        {children}
      </div>
    </div>
  );
};
