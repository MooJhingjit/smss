"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { ExternalLinkIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PurchaseOrderWithRelations } from "@/types";
import { usePurchaseOrderInfoModal } from "@/hooks/use-po-info-modal";

import { PrinterIcon } from "lucide-react";
import {
  PurchaseOrderPaymentType,
  PurchaseOrderStatus,
  QuotationStatus,
} from "@prisma/client";
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
import { customRevalidatePath } from "@/actions/revalidateTag";
import PO_SERVICES from "@/app/services/api.purchase-order";
import PaymentOptionControl from "@/components/payment-option-control";
import QT_SERVICES from "@/app/services/api.quotation";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormInput } from "../form/form-input";
import { Input } from "../ui/input";
import { usePurchaseOrderReceiptModal } from "@/hooks/use-po-receipt-modal";
import Link from "next/link";
import { ReceiptPrint } from "@/components/print-receipt";

export const PurchaseInfoModal = () => {
  const modal = usePurchaseOrderInfoModal();
  const data = modal.data;
  // const [isActionAreaOpen, setIsOpenActionArea] = React.useState(false)

  if (!data) {
    return null;
  }

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex space-x-1 items-center">
              {/* <PenBoxIcon className="w-5 h-5 " /> */}
              <span> {data?.code}</span>
            </div>
          </DialogTitle>
          {/* <DialogDescription>เลือกชื่อลูกค้า และประเภทของ QT</DialogDescription> */}
        </DialogHeader>
        <MainForm data={data} />

        {/* <DialogFooter className="border-t pt-6">

          <Collapsible
            open={isActionAreaOpen}
            onOpenChange={setIsOpenActionArea}
            className="w-full space-y-2"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center space-x-1 justify-center cursor-pointer">
                <h4 className="text-sm font-semibold">
                  ดำเนินการเพิ่มเติม
                </h4>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <div className="w-full grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2 flex items-center justify-center">
                  <DeleteComponent
                    onDeleted={modal.onClose}
                    quotationId={data?.id}
                    hasList={data?.lists ? data.lists.length > 0 : false}
                  />
                </div>
                <div className="bg-gray-50 p-2 flex items-center justify-center">
                  <VersionUpdate
                    hasPo={!!data?.purchaseOrders?.length}
                    currentVersion={data?.code}
                    quotationId={data?.id}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>



        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

const MainForm = ({
  data: originalData,
}: {
  data: PurchaseOrderWithRelations;
}) => {
  const [data, setData] = React.useState(originalData);

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    {
      status?: PurchaseOrderStatus;
      paymentDue?: string;
      paymentType?: PurchaseOrderPaymentType;
      vendorQtCode?: string;
    }
  >({
    mutationFn: async (fields) => {
      const res = await PO_SERVICES.put(data.id, {
        ...fields,
      });
      return res;
    },
    onSuccess: async (n) => {
      toast.success("อัพเดทสำเร็จ");
      customRevalidatePath(`/purchase-orders/${data.id}`);
    },
  });

  const handleItemChange = (payload: {
    status?: PurchaseOrderStatus;
    paymentDue?: string;
    paymentType?: PurchaseOrderPaymentType;
    vendorQtCode?: string;
  }) => {
    let payloadBody: Record<string, any> = {};

    const updateField = <T,>(
      key: string,
      newValue: T | undefined,
      oldValue: T,
      allowEmpty: boolean = false,
      transform: (v: T) => any = (v) => v
    ) => {
      console.log("🚀 ~ newValue:", newValue)
      if (
        newValue !== undefined &&
        (allowEmpty ? newValue !== oldValue : newValue && newValue !== oldValue)
      ) {
        payloadBody[key] = transform(newValue);
 
        // Update local state
        setData((prev) => ({
          ...prev,
          [key]: payloadBody[key],
        }));
      }
    };

    updateField("status", payload.status, data.status);
    updateField(
      "paymentDue",
      payload.paymentDue,
      data.paymentDue?.toISOString()?.split("T")[0],
      true,
      (v) => (v ? new Date(v) : null)
    );
    updateField("paymentType", payload.paymentType, data.paymentType);
    updateField("vendorQtCode", payload.vendorQtCode, data.vendorQtCode, true);

    if (Object.keys(payloadBody).length === 0) {
      return;
    }

    mutate(payloadBody);
  };

  // quotation mutation
  const { mutate: qtMutate } = useMutation<
    MutationResponseType,
    Error,
    {
      status?: QuotationStatus;
    }
  >({
    mutationFn: async (fields) => {
      if (!data.quotationId) {
        return;
      }
      return await QT_SERVICES.put(data.quotationId, {
        ...fields,
      });
    },
    onSuccess: async (n) => {
      // toast.success("อัพเดทสถานะ QT สำเร็จ");
      customRevalidatePath(`/purchase-orders/${data.id}`);
    },
  });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12   gap-6 ">
        <ItemList label="สถานะ PO">
          <div className=" text-sm leading-6 text-gray-700 flex space-x-2">
            <div className="">
              <StatusDropdown
                onStatusChange={(s) => {
                  handleItemChange({ status: s });

                  // sync status to quotation
                  let qtStatus: QuotationStatus | undefined;
                  if (s === "draft") {
                    qtStatus = "po_preparing" as QuotationStatus;
                  } else if (s === "po_sent") {
                    qtStatus = "po_sent" as QuotationStatus;
                  } else if (s === "product_received") {
                    qtStatus = "product_received" as QuotationStatus;
                  }

                  if (!qtStatus) {
                    return;
                  }
                  qtMutate({ status: qtStatus });
                }}
                curStatus={data.status}
              />
            </div>
          </div>
        </ItemList>

        {data.quotation?.code && (
          <ItemList label="QT Code">
            <Link
              target="_blank"
              href={`/quotations/${data.quotationId}`}
              className="flex items-center space-x-2"
            >
              <span>{data.quotation?.code}</span>
              <ExternalLinkIcon className="w-4 h-4 text-blue-500" />
            </Link>
          </ItemList>
        )}

        <ItemList label="การชำระเงิน">
          <PaymentOptionControl
            onUpdate={handleItemChange}
            paymentType={data.paymentType}
            paymentDue={data.paymentDue?.toDateString() ?? ""}
          />
        </ItemList>
        <ItemList label="เลขใบเสนอราคา">
          <div className="flex space-x-3 items-center">
            <FormInput
              id="deliveryPeriod"
              className="text-xs w-full"
              placeholder=""
              defaultValue={data.vendorQtCode}
              onBlur={(e) => {
                const vendorQtCode = e.target.value ?? "";
                handleItemChange({ vendorQtCode });
              }}
            />
          </div>
        </ItemList>
        <ItemList label="พิมพ์ใบสั่งซื้อ">
          <div className="flex space-x-3 items-center">
            <ReceiptPrint endpoint={`/api/purchase-orders/bills/${data.id}`} />
          </div>
        </ItemList>
      </div>
    </div>
  );
};

const ItemList = ({
  label,
  info,
  children,
}: {
  label?: string;
  info?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="col-span-12 pt-2">
      <div className=" flex justify-between items-center px-6 h-full">
        <div className="flex space-x-2 items-center">
          {label && (
            <p className="text-sm leading-6 text-gray-600 max-w-[150px] whitespace-pre-wrap">
              {label}
            </p>
          )}
          {info && <HoverInfo message={info} />}
        </div>
        <div className="w-[200px]">{children}</div>
      </div>
    </div>
  );
};

// const PrintOrderReceipt = ({ data }: {
//   data: PurchaseOrderWithRelations
// }) => {
//   const poReceiptModal = usePurchaseOrderReceiptModal();
//   const { purchaseOrderItems, ...rest } = data

//   return (
//     <Button

//       onClick={() => {
//         poReceiptModal.onOpen(data);

//       }}
//       size={"sm"} variant={"secondary"} type="submit">
//       <PrinterIcon className="w-4 h-4" />
//     </Button>
//   )
// }

const StatusDropdown = ({
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
          <SelectItem
            className={
              status === curStatus
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700"
            }
            value={status}
            key={index}
          >
            {purchaseOrderStatusMapping[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const HoverInfo = ({ message }: { message: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="w-4 h-4 text-orange-500" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
