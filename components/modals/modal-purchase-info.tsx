"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import { PurchaseOrderWithRelations } from "@/types";
import { usePurchaseOrderInfoModal } from "@/hooks/use-po-info-modal";

import {  PrinterIcon } from "lucide-react";
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
} from "@/components/ui/tooltip"
import { FormInput } from "../form/form-input";
import { Input } from "../ui/input";

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


const MainForm = ({ data }: {
  data: PurchaseOrderWithRelations;
}) => {

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

  // // quotation mutation
  // const { mutate: qtMutate } = useMutation<
  //   MutationResponseType,
  //   Error,
  //   {
  //     status?: QuotationStatus;
  //   }
  // >({
  //   mutationFn: async (fields) => {
  //     if (!quotationId) {
  //       return;
  //     }
  //     return await QT_SERVICES.put(quotationId, {
  //       ...fields,
  //     });
  //   },
  //   onSuccess: async (n) => {
  //     toast.success("อัพเดทสถานะ QT สำเร็จ");
  //     customRevalidatePath(`/purchase-orders/${data.id}`);
  //   },
  // });

  const handleChange = (payload: {
    status?: PurchaseOrderStatus;
    paymentDue?: string;
    paymentType?: PurchaseOrderPaymentType;
    vendorQtCode?: string;
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

    payloadBody["vendorQtCode"] = payload.vendorQtCode

    if (payload.paymentType) {
      payloadBody["paymentType"] = payload.paymentType;
    }

    // call mutation
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
      toast.success("อัพเดทสถานะ QT สำเร็จ");
      customRevalidatePath(`/purchase-orders/${data.id}`);
    },
  });

  // const quotationCode = data.quotation
  // const quotationStatus = data.quotation?

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12   gap-6 ">

        <ItemList label="สถานะ PO">
          <div className=" text-sm leading-6 text-gray-700 flex space-x-2">
            {/* {isLocked && (
              <div className="col-span-1 flex items-center">
                <LockIcon className="w-4 h-4 text-yellow-500" />
              </div>
            )} */}
            <div className="">
              <StatusDropdown
                onStatusChange={(s) => {
                  handleChange({ status: s });

                  // sync status to quotation
                  let qtStatus: QuotationStatus | undefined;
                  if (s === "draft") {
                    qtStatus = "draft" as QuotationStatus;
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

        <ItemList label="การชำระเงิน">
          <PaymentOptionControl
            onUpdate={handleChange}
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
                handleChange({ vendorQtCode });
              }}
            />
          </div>
        </ItemList>
        <ItemList label="พิมพ์ใบสั่งซื้อ">
        <div className="flex space-x-3 items-center">

            <PrintOrderForm
              orderId={data.id}
            />
          </div>
        </ItemList>

      </div>
    </div>
  )
}

const ItemList = ({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="col-span-12 pt-2">
      <div className=" flex justify-between items-center px-6 h-full">
        {label && <p className="text-sm leading-6 text-gray-600 max-w-[150px] whitespace-pre-wrap">{label}</p>}
        <div className="w-[200px]">{children}</div>
      </div>
    </div>
  );
};


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

const PrintOrderForm = ({ orderId }: { orderId: number }) => {
  const onPrintClick = (date: Date) => {
    try {
      fetch(`/api/purchase-orders/invoice/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: date.toISOString() }),
      })
        .then((res) => res.blob())
        .then((blob) => URL.createObjectURL(blob))
        .then((url) => {
          // Create an anchor element and use it to navigate to the URL
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank"; // Ensure it opens in a new tab
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Optionally, you might not want to revoke the URL immediately
          // since the file might still be loading in the new tab
          // window.URL.revokeObjectURL(url);

          // You might want to revoke it later or based on some other conditions
          setTimeout(() => {
            window.URL.revokeObjectURL(url); // Clean up the blob URL after it's no longer needed
          }, 60000); // for example, after 1 minute
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const date = formData.get("po-bill") as string;
        if (date) {
          onPrintClick(new Date(date));
        }
      }}
      className="flex w-full max-w-sm items-center space-x-2"
        >
      <Input
        id="po-bill"
        name="po-bill"
        type="date"
        placeholder="วันที่"
        defaultValue={new Date().toISOString().split("T")[0]}
      />
      <Button size={"sm"} variant={"secondary"} type="submit">
        <PrinterIcon className="w-4 h-4" />
      </Button>
    </form>
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
  )
}