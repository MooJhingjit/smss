"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQuotationInfoModal } from "@/hooks/use-quotation-info-modal";
import React from "react";
import { LockIcon, PrinterIcon, Send, Clock, CheckCircle, PenBoxIcon, InfoIcon, Delete } from "lucide-react";
import {
  PurchaseOrderPaymentType,
  QuotationStatus,
} from "@prisma/client";
import { quotationStatusMapping } from "@/app/config";
import { MutationResponseType } from "@/components/providers/query-provider";
import { useMutation } from "@tanstack/react-query";
import QT_SERVICES from "@/app/services/api.quotation";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/form-input";
import { customRevalidatePath } from "@/actions/revalidateTag";
import PaymentOptionControl from "@/components/payment-option-control";
import ConfirmActionButton from "@/components/confirm-action";
import StatusBadge from "@/components/badges/status-badge";
import PaymentBadge from "@/components/badges/payment-badge";
import { useSession } from "next-auth/react";
import { QuotationWithRelations } from "@/types";
import QuotationStatusDropdown from "@/app/(platform)/(directory)/quotations/[quotationId]/_components/quotation-status-dropdown";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation";


export const QuotationInfoModal = () => {
  const modal = useQuotationInfoModal();
  const data = modal.data;

  if (!data) {
    return null;
  }

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>

            <div className="flex space-x-1 items-center">
              <PenBoxIcon className="w-5 h-5 " />
              <span> {data?.code}</span>
            </div>
          </DialogTitle>
          {/* <DialogDescription>เลือกชื่อลูกค้า และประเภทของ QT</DialogDescription> */}
        </DialogHeader>

        <QuotationForm
          data={data}
          hasList={data.lists ? data.lists.length > 0 : false}

        />
        <DialogFooter className="border-t pt-6">
          <div className="flex w-full justify-center items-center">
            <DeleteComponent
              onDeleted={modal.onClose}
              quotationId={data?.id}
              hasList={data?.lists ? data.lists.length > 0 : false}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const QuotationForm = (props: {
  data: QuotationWithRelations;
  hasList: boolean;
}) => {
  const { hasList, data } = props;
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const {
    id: quotationId,
    status,
    isLocked,
    purchaseOrderRef,
    deliveryPeriod,
    validPricePeriod,
    type
  } = data;

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    {
      purchaseOrderRef?: string;
      status?: QuotationStatus;
      paymentDue?: string;
      paymentType?: PurchaseOrderPaymentType;
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
      customRevalidatePath(`/quotations/${quotationId}`);
    },
  });

  const handleItemChange = (payload: {
    status?: QuotationStatus;
    paymentDue?: string;
    paymentType?: PurchaseOrderPaymentType;
    purchaseOrderRef?: string;
    deliveryPeriod?: string;
    validPricePeriod?: string;
    type?: "product" | "service";
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

    if (payload.purchaseOrderRef) {
      payloadBody["purchaseOrderRef"] = payload.purchaseOrderRef;
    }

    if (payload.deliveryPeriod || payload.deliveryPeriod === "") {
      payloadBody["deliveryPeriod"] = payload.deliveryPeriod
        ? parseInt(payload.deliveryPeriod)
        : null;
    }

    if (payload.validPricePeriod || payload.validPricePeriod === "") {
      payloadBody["validPricePeriod"] = payload.validPricePeriod
        ? parseInt(payload.validPricePeriod)
        : null;
    }

    if (payload.type) {
      payloadBody["type"] = payload.type;
    }

    // call mutation
    mutate(payloadBody);
  };


  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12   gap-6 ">
        <ItemList label="ประเภท">
          <div className="space-x-2 flex items-center w-[200px] ">
            {
              hasList && (
                <HoverInfo message="ไม่สามารถเปลี่ยนประเภทได้ เนื่องจากมีรายการสินค้าแล้ว" />
              )
            }
            <Tabs defaultValue={type} className="w-full" >
              <TabsList className=" flex">
                <TabsTrigger
                  disabled={hasList}
                  className="flex-1 text-xs"
                  value="product"
                  onClick={() => handleItemChange({ type: "product" })}
                >
                  สินค้า
                </TabsTrigger>
                <TabsTrigger
                  disabled={hasList}
                  className="flex-1 text-xs"
                  value="service"
                  onClick={() => handleItemChange({ type: "service" })}
                >
                  บริการ
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </ItemList>
        <ItemList label="สถานะ">
          <div className=" text-sm leading-6 text-gray-700 flex space-x-2">
            {isLocked && (
              <div className="col-span-1 flex items-center">
                <LockIcon className="w-4 h-4 text-yellow-500" />
              </div>
            )}
            {isAdmin ? (
              <div className="">
                <QuotationStatusDropdown
                  onStatusChange={(s) => {
                    handleItemChange({ status: s });
                  }}
                  curStatus={status}
                />
              </div>
            ) : (
              <ApprovalButton
                hasList={hasList}
                currentStatus={status}
                onApprove={(s) => {
                  handleItemChange({
                    status: s,
                  });
                }}
              />
            )}
          </div>
        </ItemList>

        <ItemList label="ระยะเวลาการส่งมอบ">
          <div className="flex space-x-3 items-center">
            <FormInput
              id="deliveryPeriod"
              className="text-xs w-full"
              placeholder="จำนวนวัน"
              defaultValue={deliveryPeriod}
              onBlur={(e) => {
                const deliveryPeriod = e.target.value ?? "";
                handleItemChange({ deliveryPeriod });
              }}
            />
          </div>
        </ItemList>
        <ItemList label="ระยะเวลาการยืนราคา">
          <div className="flex space-x-3 items-center">
            <FormInput
              id="validPricePeriod"
              className="text-xs w-full"
              placeholder="จำนวนวัน"
              defaultValue={validPricePeriod}
              onBlur={(e) => {
                const validPricePeriod = e.target.value ?? "";
                handleItemChange({ validPricePeriod });
              }}
            />
          </div>
        </ItemList>
        <ItemList label="อ้างอิงใบสั่งซื้อ">
          <div className="-mt-1 ">
            <PurchaseOrderRefInput
              defaultValue={purchaseOrderRef ?? ""}
              onUpdate={handleItemChange}
            />
          </div>
        </ItemList>
        {!isAdmin && (
          <ItemList label="การชำระเงิน">
            <div className="flex space-x-3 items-center">
              <PaymentBadge paymentType={data.paymentType} paymentDue={data.paymentDue ? new Date(data.paymentDue).toISOString().split("T")[0] : ""} />
            </div>
          </ItemList>
        )}
        {isAdmin && (
          <>
            <ItemList label="การชำระเงิน">
              <div className="space-x-8 flex items-center w-[200px] ">

                <PaymentOptionControl
                  paymentType={data.paymentType}
                  paymentDue={data.paymentDue ? new Date(data.paymentDue).toISOString().split("T")[0] : ""}
                  onUpdate={handleItemChange}
                />


              </div>
            </ItemList>

            <ItemList label="">
              <div className="space-x-8 flex items-center">
                <PrintButton quotationId={quotationId} hasList={hasList} />
              </div>
            </ItemList>
          </>

        )}
      </div>
    </div>
  );
}

const ApprovalButton = ({
  hasList,
  onApprove,
  currentStatus,
}: {
  hasList: boolean;
  onApprove: (status: QuotationStatus) => void;
  currentStatus: QuotationStatus;
}) => {
  if (currentStatus === QuotationStatus.open) {
    return (
      <ConfirmActionButton
        onConfirm={() => {
          onApprove(QuotationStatus.pending_approval);
        }}
      >
        <Button
          variant="default"
          disabled={!hasList}
          className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
        >
          <Send className="w-4 h-4 mr-1" />
          <span>ส่งอนุมัติ</span>
        </Button>
      </ConfirmActionButton>
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
          <ConfirmActionButton
            onConfirm={() => {
              onApprove(QuotationStatus.approved);
            }}
          >
            <button className="text-xs text-orange-400 hover:text-orange-500 underline mt-1 cursor-pointer ">
              ยืนยันการอนุมัติจากลูกค้า
            </button>
          </ConfirmActionButton>
        </div>
      </div>
    );
  }

  return (
    <StatusBadge
      status={quotationStatusMapping[currentStatus].label}
      isSuccess={currentStatus === QuotationStatus.paid}
      isWarning={currentStatus === QuotationStatus.delivered}
    />
  );
};

const PrintButton = ({
  quotationId,
  hasList,
}: {
  quotationId: number;
  hasList: boolean;
}) => {
  const onPrintClick = () => {
    try {
      fetch(`/api/quotations/invoice/${quotationId}`, { method: "POST" })
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
    <Button
      onClick={onPrintClick}
      disabled={!hasList}
      variant="outline"
      className="inline-flex items-center px-2 py-2 rounded-md bg-gray-100 text-gray-700 text-xs h-full"
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
  return (
    <FormInput
      id="Ref_PO"
      label=""
      className="text-xs w-full"
      placeholder="PO-xxxxxx"
      defaultValue={defaultValue}
      onBlur={(e) => {
        // get current value
        const purchaseOrderRef = e.target?.value || "";

        // check if value is different from default
        if (purchaseOrderRef === defaultValue) return;

        onUpdate({ purchaseOrderRef });
      }}
    />
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
      <div className=" flex justify-between items-center px-6 h-full">
        {label && <p className="text-sm leading-6 text-gray-600">{label}</p>}
        {children}
      </div>
    </div>
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

const DeleteComponent = ({
  quotationId,
  hasList,
  onDeleted,
}: {
  quotationId: number;
  hasList: boolean;
  onDeleted: () => void;
}) => {
  const router = useRouter();

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    { quotationId: number }
  >({
    mutationFn: async (fields) => {
      const res = await QT_SERVICES.delete(fields.quotationId);
      return res;
    },
    onSuccess: async (n) => {
      toast.success("ลบสำเร็จ");
      // invalidate query
      // redirect to quotation list
      customRevalidatePath(`/quotations`);
      router.push("/quotations");

      onDeleted();

    },
  });

  const handleDelete = () => {
    // router.push("/quotations");  
    mutate({ quotationId });
  };

  if (hasList) {
    return (
      <span className="text-gray-500 text-xs">ไม่สามารถลบได้ เนื่องจากมีรายการสินค้าแล้ว</span>
    )
  }

  return (
    <ConfirmActionButton
      onConfirm={handleDelete}
    >
      <Button
        variant="outline"
        disabled={hasList}
        className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
      >
        <Delete className="w-4 h-4 mr-1" />
        <span>ลบใบเสนอราคา</span>
      </Button>
    </ConfirmActionButton>
  );
}