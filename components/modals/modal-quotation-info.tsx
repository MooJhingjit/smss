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
import React, { useRef, useState, useCallback } from "react";
import {
  ArrowLeftRight,
  ArrowRightIcon,
  ChevronsUpDown,
  ClipboardCheckIcon,
  HistoryIcon,
  XIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  PrinterIcon,
  Send,
  Clock,
  InfoIcon,
  Copy,
} from "lucide-react";
import { PurchaseOrderPaymentType, QuotationStatus } from "@prisma/client";
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
import { QuotationWithRelations } from "@/types";
import QuotationStatusDropdown from "@/app/(platform)/(directory)/quotations/[quotationId]/_components/quotation-status-dropdown";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useCloneQuotationModal } from "@/hooks/use-clone-quotation-modal";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { getCurrentDateTime, updateCodeVersion } from "@/lib/utils";
import { CheckCircle2Icon } from "lucide-react";

import { Input } from "../ui/custom-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAssignSellerModal } from "@/hooks/use-assign-seller-modal";
import { Checkbox } from "@/components/ui/checkbox";

export const QuotationInfoModal = () => {
  const modal = useQuotationInfoModal();
  const data = modal.data;
  const [isActionAreaOpen, setIsOpenActionArea] = React.useState(false);
  const isAdmin = useIsAdmin();

  if (!data) {
    return null;
  }

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex space-x-1 items-center">
              {/* <PenBoxIcon className="w-5 h-5 " /> */}
              <span> {data?.code}</span>
            </div>
          </DialogTitle>
          {/* <DialogDescription>เลือกชื่อลูกค้า และประเภทของ QT</DialogDescription> */}
        </DialogHeader>

        <MainForm
          closeModal={modal.onClose}
          originalData={data}
          hasList={data.lists ? data.lists.length > 0 : false}
        />
        {isAdmin && (
          <DialogFooter className="border-t pt-6">
            <Collapsible
              open={isActionAreaOpen}
              onOpenChange={setIsOpenActionArea}
              className="w-full space-y-2"
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center space-x-1 justify-center cursor-pointer">
                  <h4 className="text-sm font-semibold">ดำเนินการเพิ่มเติม</h4>
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
                  <div className="bg-gray-50 p-2 flex items-center justify-center">
                    <CloneComponent quotation={data} onCloned={modal.onClose} />
                  </div>
                  <div className="bg-gray-50 p-2 flex items-center justify-center">
                    <AssignedSeller
                      quotation={data}
                      onCloseINfoModal={modal.onClose}
                    />
                  </div>

                  <RollbackQuotation quotationId={data.id} quotation={data} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MainForm = (props: {
  originalData: QuotationWithRelations;
  hasList: boolean;
  closeModal: () => void;
}) => {
  const { hasList, originalData, closeModal } = props;
  const isAdmin = useIsAdmin();

  const [data, setData] = useState(originalData);

  const {
    id: quotationId,
    status,
    isLocked,
    purchaseOrderRef,
    deliveryPeriod,
    validPricePeriod,
    type,
    vatIncluded,
  } = data;

  const shouldCloseModal = React.useRef(false);

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

      if (shouldCloseModal.current) {
        closeModal();
      }

      customRevalidatePath(`/quotations/${quotationId}`);
    },
  });

  const handleItemChange = useCallback(
    (
      payload: {
        status?: QuotationStatus;
        paymentDue?: string;
        paymentType?: PurchaseOrderPaymentType;
        purchaseOrderRef?: string;
        deliveryPeriod?: string;
        paymentCondition?: string;
        validPricePeriod?: string;
        type?: "product" | "service";
        vatIncluded?: boolean;
      },
      fieldKey?: string
    ) => {
      let payloadBody: Record<string, any> = {};

      const updateField = <T,>(
        key: string,
        newValue: T | undefined,
        oldValue: T,
        transform: (v: T) => any = (v) => v,
        allowEmpty: boolean = false
      ) => {
        // Only update if this is the field being changed or if no specific field is provided
        if (fieldKey && fieldKey !== key) {
          return;
        }

        console.log("🚀 ~ newValue:", key, newValue);
        console.log("🚀 ~ oldValue:", key, oldValue);

        if (
          newValue !== undefined &&
          (allowEmpty
            ? newValue !== oldValue
            : newValue && newValue !== oldValue)
        ) {
          console.log("🚀 ~ will update");
          payloadBody[key] = transform(newValue);

          // Update local state
          setData((prev) => ({
            ...prev,
            [key]: payloadBody[key],
          }));
        }
      };

      updateField("status", payload.status, status);
      updateField(
        "paymentDue",
        payload.paymentDue || "",
        data.paymentDue?.toISOString()?.split("T")[0] || "",
        (v) => (v ? new Date(v) : null),
        true
      );
      updateField("paymentType", payload.paymentType, data.paymentType);

      // console.log('v', payload)
      // console.log('v', payload.purchaseOrderRef ?? "")
      updateField(
        "purchaseOrderRef",
        payload.purchaseOrderRef ?? "",
        data.purchaseOrderRef ?? "",
        undefined,
        true
      );
      updateField(
        "deliveryPeriod",
        payload.deliveryPeriod || "",
        data.deliveryPeriod?.toString() || "",
        (v) => (v ? parseInt(v) : null),
        true
      );
      updateField(
        "validPricePeriod",
        payload.validPricePeriod || "",
        data.validPricePeriod?.toString() || "",
        (v) => (v ? parseInt(v) : null),
        true
      );
      updateField("type", payload.type, data.type);
      updateField(
        "paymentCondition",
        payload.paymentCondition || "",
        data.paymentCondition || ""
      );
      updateField("vatIncluded", payload.vatIncluded, data.vatIncluded, (v) => !!v, true);

      if (Object.keys(payloadBody).length === 0) {
        return;
      }

      mutate(payloadBody);
    },
    [data, status, mutate]
  );

  const handlePaymentConditionChange = useCallback(
    (value: string) => {
      handleItemChange({ paymentCondition: value }, "paymentCondition");
    },
    [handleItemChange]
  );

  const quotationInvoice = data?.invoices ? data.invoices[0] : null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12   gap-6 ">
        <ItemList
          label="ประเภท"
          info={
            hasList
              ? "ไม่สามารถเปลี่ยนประเภทได้ เนื่องจากมีรายการสินค้าแล้ว"
              : ""
          }
        >
          <Tabs defaultValue={type} className="w-full">
            <TabsList className=" flex">
              <TabsTrigger
                disabled={hasList}
                className="flex-1 text-xs"
                value="product"
                onClick={() => handleItemChange({ type: "product" }, "type")}
              >
                สินค้า
              </TabsTrigger>
              <TabsTrigger
                disabled={hasList}
                className="flex-1 text-xs"
                value="service"
                onClick={() => handleItemChange({ type: "service" }, "type")}
              >
                บริการ
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </ItemList>
        <ItemList label="สถานะ">
          <div className=" text-sm leading-6 text-gray-700 flex space-x-2  w-full">
            {/* {isLocked && (
              <div className="col-span-1 flex items-center">
                <LockIcon className="w-4 h-4 text-yellow-500" />
              </div>
            )} */}
            {isAdmin ? (
              <div className="w-full">
                <QuotationStatusDropdown
                  onStatusChange={(s) => {
                    shouldCloseModal.current = true;
                    handleItemChange({ status: s }, "status");
                  }}
                  curStatus={status}
                />
              </div>
            ) : (
              <QuotationStatusForSeller
                hasList={hasList}
                currentStatus={status}
                onApprove={(s) => {
                  shouldCloseModal.current = true;
                  handleItemChange(
                    {
                      status: s,
                    },
                    "status"
                  );
                }}
              />
            )}
          </div>
        </ItemList>

        <ItemList label="ระยะเวลาการส่งมอบ (วัน)">
          <div className="flex space-x-3 items-center">
            <FormInput
              id="deliveryPeriod"
              className="text-xs w-full"
              placeholder="จำนวนวัน"
              type="number"
              defaultValue={deliveryPeriod}
              onBlur={(e) => {
                const deliveryPeriod = e.target.value ?? "";
                handleItemChange({ deliveryPeriod }, "deliveryPeriod");
              }}
            />
          </div>
        </ItemList>
        <ItemList label="ระยะเวลาการยืนราคา (วัน)">
          <div className="flex space-x-3 items-center">
            <FormInput
              id="validPricePeriod"
              className="text-xs w-full"
              type="number"
              placeholder="จำนวนวัน"
              defaultValue={validPricePeriod}
              onBlur={(e) => {
                const validPricePeriod = e.target.value ?? "";
                handleItemChange({ validPricePeriod }, "validPricePeriod");
              }}
            />
          </div>
        </ItemList>
       
        <ItemList label="อ้างอิงใบสั่งซื้อ">
          <div className="-mt-1 ">
            <PurchaseOrderRefInput
              defaultValue={purchaseOrderRef ?? ""}
              onUpdate={(payload) =>
                handleItemChange(payload, "purchaseOrderRef")
              }
            />
          </div>
        </ItemList>
        {!isAdmin && (
          <ItemList label="การชำระเงิน">
            <div className="flex space-x-3 items-center">
              <PaymentBadge
                paymentType={data.paymentType}
                paymentDue={
                  data.paymentDue
                    ? new Date(data.paymentDue).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
          </ItemList>
        )}
        {/* <ItemList label="พิมพ์ใบเสนอราคา">
          <div className="flex space-x-3 items-center">
            <PrintQuotation quotationId={quotationId} hasList={hasList} />
          </div>
        </ItemList> */}
        {/* {data.status !== QuotationStatus.open &&
          data.status !== QuotationStatus.pending_approval && (
            
          )} */}
        <ItemList label="พิมพ์ใบเสนอราคา">
          <div className="flex space-x-3 items-center">
            <PrintQuotation
              quotationId={quotationId}
              hasList={hasList}
              defaultDate={data.approvedAt ?? new Date()}
            />
          </div>
        </ItemList>
        {isAdmin && (
          <>
            <ItemList label="การชำระเงิน">
              <div className="space-x-8 flex items-center  ">
                <PaymentOptionControl
                  paymentType={data.paymentType}
                  paymentDue={
                    data.paymentDue
                      ? new Date(data.paymentDue).toISOString().split("T")[0]
                      : ""
                  }
                  onUpdate={(payload) => {
                    handleItemChange(
                      { paymentType: payload.paymentType },
                      "paymentType"
                    );
                    handleItemChange(
                      { paymentDue: payload.paymentDue },
                      "paymentDue"
                    );
                  }}
                />
              </div>
            </ItemList>

            <ItemList label="เงื่อนไขการชำระเงิน">
              <div className="space-x-8 flex items-center  ">
                <PaymentCondition
                  defaultValue={data.paymentCondition || "cash"}
                  onChange={handlePaymentConditionChange}
                />
              </div>
            </ItemList>

             <ItemList label="สถานะ VAT"
          info="เมื่อ QT นี้ได้รับการยืนยันแล้ว จะไม่สามารถเปลี่ยนแปลงได้"
        >
          <div className="flex space-x-3 items-center h-9">
             <Checkbox
                id="vatIncluded"
                disabled={isLocked}
                checked={vatIncluded}
                onCheckedChange={(c) => {
                  handleItemChange({ vatIncluded: !!c }, "vatIncluded");
                }}
              />
            <label
              htmlFor="vatIncluded"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              รวม Vat
            </label>
          </div>
        </ItemList>

            {data.type === "service" && (
              <ItemList
                label="ออกใบกำกับภาษี"
                successInfo={
                  quotationInvoice?.receiptCode
                    ? "ออกใบกำกับภาษีแล้ว " + quotationInvoice.receiptCode
                    : undefined
                }
                info={
                  !quotationInvoice?.receiptCode
                    ? "ออกครั้งถัดไป เลข INV จะไม่เปลี่ยน"
                    : undefined
                }
              >
                {quotationInvoice ? (
                  <div className="flex space-x-3 items-center">
                    <ReceiptInvoice hasList={hasList} quotation={data} />
                  </div>
                ) : (
                  <div className="flex space-x-2 items-center">
                    <InfoIcon className="w-4 h-4 text-orange-500" />
                    <p className="text-orange-500 text-sm">
                      ต้องมีใบวางบิล และใบแจ้งหนี้ก่อน
                    </p>
                  </div>
                )}
              </ItemList>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PaymentCondition = ({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (value: string) => void;
}) => {
  const [selectedCondition, setSelectedCondition] = React.useState(
    defaultValue === "cash" ? "cash" : "other"
  );
  const [inputValue, setInputValue] = React.useState(
    defaultValue !== "cash" ? defaultValue : ""
  );
  const firstUpdate = useRef(true);

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    if (selectedCondition === "other") {
      return;
    }

    onChange(selectedCondition);
  }, [selectedCondition, onChange]);

  return (
    <div className="flex items-center space-x-3">
      <ToggleGroup
        type="single"
        value={selectedCondition}
        onValueChange={(value) => setSelectedCondition(value)}
      >
        <ToggleGroupItem value="cash">
          <p>เงินสด</p>
        </ToggleGroupItem>
        <ToggleGroupItem value="other" className="whitespace-nowrap">
          ระบุวัน
        </ToggleGroupItem>
      </ToggleGroup>
      {selectedCondition === "other" && (
        <Input
          id="otherPaymentCondition"
          placeholder="โปรดระบุ"
          className="text-xs w-full"
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => onChange(inputValue)}
        />
      )}
    </div>
  );
};

const QuotationStatusForSeller = ({
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
      <Alert>
        <CheckCircle2Icon className="size-4 -mt-1" />
        <AlertTitle className="">ได้รับการอนุมัติแล้ว</AlertTitle>
        <AlertDescription>
          <div className="text-sm">
            <p>สามารถนำส่งให้ลูกค้าได้</p>
            <div className=" border-t pt-2 mt-2 space-y-3">
              <div className="flex items-center">
                <div className="">
                  <ArrowRightIcon className="w-4 h-4 mr-1 text-green-700" />
                </div>
                <ConfirmActionButton
                  onConfirm={() => {
                    onApprove(QuotationStatus.approved);
                  }}
                >
                  <button className="text-xs text-green-700 hover:text-green-800 underline mt-1 cursor-pointer ">
                    ลูกค้าอนุมัติแล้ว
                  </button>
                </ConfirmActionButton>
              </div>
              <div className="flex items-center">
                <div className="">
                  <ArrowRightIcon className="w-4 h-4 mr-1 text-orange-400" />
                </div>
                <ConfirmActionButton
                  onConfirm={() => {
                    onApprove(QuotationStatus.open); // reset to open
                  }}
                >
                  <button className="text-xs text-orange-400 hover:text-orange-500 underline mt-1 cursor-pointer ">
                    แก้ไขใบเสนอราคา
                  </button>
                </ConfirmActionButton>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
      // <div className="flex items-start space-x-1 h-full">
      //   <CheckCircle className="w-4 h-4 mr-1  text-green-700" />
      //   <div className="">
      //     <p className="text-sm text-green-700 ">
      //       ได้รับการอนุมัติ: สามารถนำส่งให้ลูกค้าได้
      //     </p>
      //     <ConfirmActionButton
      //       onConfirm={() => {
      //         onApprove(QuotationStatus.approved);
      //       }}
      //     >
      //       <button className="text-xs text-orange-400 hover:text-orange-500 underline mt-1 cursor-pointer ">
      //         ยืนยันการอนุมัติจากลูกค้า
      //       </button>
      //     </ConfirmActionButton>
      //   </div>
      // </div>
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

const ReceiptInvoice = ({
  hasList,
  quotation,
}: {
  hasList: boolean;
  quotation: QuotationWithRelations;
}) => {
  const { invoices } = quotation;

  const quotationInvoice = invoices ? invoices[0] : null;

  const firstInvoiceDate = quotationInvoice?.receiptDate
    ? new Date(quotationInvoice.receiptDate)
    : new Date();

  const [isDone, setIsDone] = React.useState(false);

  const onPrintClick = (date: Date) => {
    setIsDone(false);
    try {
      fetch(`/api/quotations/receipt-invoice/${quotation.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: date.toISOString() }),
      })
        .then((res) => res.blob())
        .then((blob) => URL.createObjectURL(blob))
        .then((url) => {
          setIsDone(true);

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
          window.URL.revokeObjectURL(url);
          // setTimeout(() => {
          //   window.URL.revokeObjectURL(url); // Clean up the blob URL after it's no longer needed
          // }, 60000); // for example, after 1 minute
        });
    } catch (error) {
      console.log("error", error);
      setIsDone(true);
    }
  };

  const formRef = useRef<HTMLFormElement>(null);

  const triggerSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const date = formData.get("date") as string;
        if (date) {
          onPrintClick(new Date(date));
        }
      }}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <Input
        id="date"
        name="date"
        type="date"
        placeholder="วันที่"
        defaultValue={firstInvoiceDate.toISOString().split("T")[0]}
      />

      <ConfirmActionButton isDone={isDone} onConfirm={triggerSubmit}>
        <Button size={"sm"} variant={"secondary"} type="button">
          <PrinterIcon className="w-4 h-4" />
        </Button>
      </ConfirmActionButton>
    </form>
  );
};

export const PrintQuotation = ({
  quotationId,
  hasList,
  defaultDate = new Date(),
}: {
  quotationId: number;
  hasList?: boolean;
  defaultDate?: Date;
}) => {
  const onPrintClick = (date: Date) => {
    try {
      fetch(`/api/quotations/qt-paper/${quotationId}`, {
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
          // window.URL.revokeObjectURL(url);
          setTimeout(() => {
            window.URL.revokeObjectURL(url); // Clean up the blob URL after it's no longer needed
          }, 300000); // for example, after 5 minute
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
        const date = formData.get("date") as string;
        if (date) {
          onPrintClick(new Date(date));
        }
      }}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <Input
        id="date"
        name="date"
        type="date"
        placeholder="วันที่"
        defaultValue={defaultDate?.toISOString().split("T")[0]}
      />
      <Button size={"sm"} variant={"secondary"} type="submit">
        <PrinterIcon className="w-4 h-4" />
      </Button>
    </form>
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

        // // check if value is different from default
        // if (purchaseOrderRef === defaultValue) return;

        onUpdate({ purchaseOrderRef });
      }}
    />
  );
};

const ItemList = ({
  label,
  info,
  successInfo,
  children,
}: {
  label?: string;
  info?: string;
  successInfo?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="col-span-12 pt-2">
      <div className=" flex justify-between items-center px-6 h-full">
        <div className="flex space-x-2 items-center">
          {label && (
            <p className="text-sm leading-6 text-gray-600 max-w-[150px] whitespace-nowrap">
              {label}
            </p>
          )}
          {info && (
            <HoverInfo
              icon={<InfoIcon className="w-4 h-4 text-orange-500" />}
              message={info}
            />
          )}
          {successInfo && (
            <HoverInfo
              icon={<ClipboardCheckIcon className="w-4 h-4 text-green-700" />}
              message={successInfo}
            />
          )}
        </div>
        <div className="w-[250px]">{children}</div>
      </div>
    </div>
  );
};

const HoverInfo = ({
  message,
  icon,
}: {
  message: string;
  icon?: React.ReactNode;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{icon}</TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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

  const { mutate, isPending } = useMutation<
    MutationResponseType,
    Error,
    { quotationId: number }
  >({
    mutationFn: async (fields) => {
      console.log("🚀 ~ mutationFn: ~ fields:", fields);
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
    onError: (error) => {
      console.error(error);
      // Show specific error message if it's about purchase orders
      if (error.message?.includes("purchase orders")) {
        toast.error("ไม่สามารถลบได้ เนื่องจากมีใบสั่งซื้อที่เกี่ยวข้อง");
      } else {
        toast.error("เกิดข้อผิดพลาดในการลบ");
      }
    },
  });

  const handleDelete = () => {
    mutate({ quotationId });
  };

  return (
    <ConfirmActionButton
      onConfirm={handleDelete}
      disabled={isPending}
      warningMessage={[
        "ทุกอย่างที่เกี่ยวข้องกับใบเสนอราคานี้จะถูกลบ",
        "รวมถึงรายการสินค้า, ใบสั่งซื้อ, และใบแจ้งหนี้",
      ]}
    >
      <Button
        variant="link"
        disabled={isPending}
        className="inline-flex items-center px-2 py-1 rounded-md text-xs h-full"
        asChild
      >
        <span>{isPending ? "กำลังลบ..." : "ลบใบเสนอราคา"}</span>
      </Button>
    </ConfirmActionButton>
  );
};

const VersionUpdate = ({
  quotationId,
  hasPo,
  currentVersion,
}: {
  quotationId: number;
  hasPo: boolean;
  currentVersion: string;
}) => {
  const router = useRouter();
  const today = getCurrentDateTime();

  const { mutate, isPending } = useMutation<
    MutationResponseType,
    Error,
    { quotationId: number; code: string }
  >({
    mutationFn: async (fields) => {
      const res = await QT_SERVICES.put(fields.quotationId, {
        code: fields.code,
        createdAt: today,
      });
      return res;
    },
    onSuccess: async (n) => {
      toast.success("อัพเดทเวอร์ชั่นสำเร็จ");
      // invalidate query
      // redirect to quotation list
      customRevalidatePath(`/quotations`);
    },
  });

  const handleUpdate = () => {
    const newVersion = updateCodeVersion(currentVersion);
    mutate({ quotationId, code: newVersion });
  };

  if (hasPo) {
    return (
      <span className="text-orange-500 text-xs">
        ไม่สามารถอัพเดทเวอร์ชั่นได้ เนื่องจากมีใบสั่งซื้อแล้ว
      </span>
    );
  }

  return (
    <ConfirmActionButton disabled={isPending} onConfirm={handleUpdate}>
      <Button
        variant="link"
        className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
      >
        <span>อัพเดทเวอร์ชั่น (R+1)</span>
      </Button>
    </ConfirmActionButton>
  );
};

export const CloneComponent = ({
  quotation,
  onCloned,
}: {
  quotation: QuotationWithRelations;
  onCloned: () => void;
}) => {
  const cloneModal = useCloneQuotationModal();

  const handleClone = () => {
    cloneModal.onOpen(quotation);
    onCloned(); // Close the info modal
  };

  return (
    <Button
      variant="link"
      onClick={handleClone}
      className="inline-flex items-center px-2 py-1 rounded-md text-xs h-full"
    >
      <Copy className="w-4 h-4 mr-1" />
      คัดลอก
    </Button>
  );
};

const AssignedSeller = ({
  quotation,
  onCloseINfoModal,
}: {
  quotation: QuotationWithRelations;
  onCloseINfoModal: () => void;
}) => {
  const assignModal = useAssignSellerModal();
  return (
    <Button
      variant="link"
      onClick={() => {
        assignModal.onOpen(quotation);
        onCloseINfoModal(); // close info modal
      }}
      className="inline-flex items-center px-2 py-1 rounded-md text-xs h-full"
    >
      <ArrowLeftRight className="w-4 h-4 mr-1" />
      เปลี่ยนผู้ขาย
    </Button>
  );
};

const RollbackQuotation = ({
  quotationId,
  quotation,
}: {
  quotationId: number;
  quotation: QuotationWithRelations;
}) => {
  // Check if rollback should be disabled
  const hasInvoiceOrBillGroup =
    (quotation.invoices && quotation.invoices.length > 0) ||
    quotation.billGroupId !== null;

  const hasInstallmentWithInvoiceOrBillGroup = quotation.installments?.some(
    (installment) =>
      (installment as any).invoice !== null || installment.billGroupId !== null
  );

  const canRollback =
    !hasInvoiceOrBillGroup &&
    !hasInstallmentWithInvoiceOrBillGroup &&
    ((quotation.purchaseOrders && quotation.purchaseOrders.length > 0) ||
      quotation.isLocked);

  let disabledReason: string | null = null;
  if (hasInvoiceOrBillGroup) {
    disabledReason = "ใบเสนอราคานี้มีใบแจ้งหนี้หรืออยู่ในกลุ่มบิลแล้ว";
  } else if (hasInstallmentWithInvoiceOrBillGroup) {
    disabledReason = "มีงวดผ่อนชำระที่มีใบแจ้งหนี้หรืออยู่ในกลุ่มบิลแล้ว";
  }

  const { mutate, isPending } = useMutation<
    {
      message: string;
      deletedPurchaseOrders: number;
      deletedInstallments: number;
      deletedItems: number;
    },
    Error,
    { quotationId: number }
  >({
    mutationFn: async (fields) => {
      const res = await fetch(
        `/api/quotations/rollback/${fields.quotationId}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to rollback quotation");
      }

      return res.json();
    },
    onSuccess: async (data) => {
      toast.success(
        `Rollback สำเร็จ (PO: ${data.deletedPurchaseOrders}, งวด: ${data.deletedInstallments})`
      );
      window.location.reload();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการ rollback");
    },
  });

  const handleRollback = () => {
    mutate({ quotationId });
  };

  if (!canRollback) {
    if (!disabledReason) {
      return null;
    }
    return (
      <div className="bg-gray-50 p-2 text-center text-orange-500 text-xs">
        <div className="flex items-center justify-center mb-1">
          <XIcon className="w-4 h-4 inline-block mr-1" />
          <p>ไม่สามารถ rollback ได้</p>
        </div>
        <p className="">{disabledReason}</p>
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="link"
                disabled
                className="inline-flex items-center px-2 py-1 rounded-md text-xs h-full text-gray-400"
              >
                <Delete className="w-4 h-4 mr-1" />
                Rollback Quotation
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{disabledReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-2 flex items-center justify-center">
      <ConfirmActionButton
        onConfirm={handleRollback}
        disabled={isPending}
        warningMessage={[
          "การ rollback จะลบใบสั่งซื้อ, รายการสินค้า, และงวดผ่อนชำระทั้งหมด",
          "และจะรีเซ็ตสถานะใบเสนอราคากลับไปเป็นสถานะก่อนอนุมัติ",
        ]}
      >
        <Button
          variant="link"
          disabled={isPending}
          className="inline-flex items-center px-2 py-1 rounded-md text-xs h-full hover:text-red-700"
          asChild
        >
          <span>
            <HistoryIcon className="w-4 h-4 inline-block mr-1" />
            {isPending ? "กำลัง Rollback..." : "Rollback"}
          </span>
        </Button>
      </ConfirmActionButton>
    </div>
  );
};
