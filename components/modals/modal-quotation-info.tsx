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
import React, { useRef } from "react";
import { ChevronsUpDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import { useIsAdmin } from "@/hooks/use-is-admin";
import { updateCodeVersion } from "@/lib/utils";
import { Input } from "../ui/input";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"


export const QuotationInfoModal = () => {
  const modal = useQuotationInfoModal();
  const data = modal.data;
  const [isActionAreaOpen, setIsOpenActionArea] = React.useState(false)

  if (!data) {
    return null;
  }

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[550px]">
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
          data={data}
          hasList={data.lists ? data.lists.length > 0 : false}

        />
        <DialogFooter className="border-t pt-6">

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



        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const MainForm = (props: {
  data: QuotationWithRelations;
  hasList: boolean;
  closeModal: () => void;
}) => {
  const { hasList, data, closeModal } = props;
  const isAdmin = useIsAdmin();
  const {
    id: quotationId,
    status,
    isLocked,
    purchaseOrderRef,
    deliveryPeriod,
    validPricePeriod,
    type
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
        closeModal()
      }


      customRevalidatePath(`/quotations/${quotationId}`);
    },
  });

  const handleItemChange = (payload: {
    status?: QuotationStatus;
    paymentDue?: string;
    paymentType?: PurchaseOrderPaymentType;
    purchaseOrderRef?: string;
    deliveryPeriod?: string;
    paymentCondition?: string;
    validPricePeriod?: string;
    type?: "product" | "service";
  }) => {
    // update what is provided
    let payloadBody: Record<string, any> = {};
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


    payloadBody['paymentCondition'] = payload.paymentCondition;

    // call mutation
    mutate(payloadBody);
  };


  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12   gap-6 ">
        <ItemList label="ประเภท"
          info={hasList ? "ไม่สามารถเปลี่ยนประเภทได้ เนื่องจากมีรายการสินค้าแล้ว" : ""}
        >
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
                    shouldCloseModal.current = true
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
              <div className="space-x-8 flex items-center  ">

                <PaymentOptionControl
                  paymentType={data.paymentType}
                  paymentDue={data.paymentDue ? new Date(data.paymentDue).toISOString().split("T")[0] : ""}
                  onUpdate={handleItemChange}
                />


              </div>
            </ItemList>

            <ItemList label="เงื่อนไงการชำระเงิน">
              <div className="space-x-8 flex items-center  ">

                <PaymentCondition
                  defaultValue={data.paymentCondition || "cash"}
                  onChange={(value) => {
                    handleItemChange({ paymentCondition: value });
                  }
                  }
                />


              </div>
            </ItemList>

            <ItemList label="พิมพ์ใบเสนอราคา"
            >
              <div className="flex space-x-3 items-center">
                <PrintQuotation
                  quotationId={quotationId}
                  hasList={hasList}
                />
              </div>
            </ItemList>
            {data.type === "service" && (
              <ItemList
                label="ออกใบกำกับภาษี"
              // info="ออกเมื่อ 20/12/2023"
              >
                <div className="flex space-x-3 items-center">
                  <PrintTaxInvoice
                    hasList={hasList}
                    quotation={data}
                  />
                </div>
              </ItemList>

            )}
          </>
        )}
      </div>
    </div>
  );
}


const PaymentCondition = ({ defaultValue, onChange }: { defaultValue: string, onChange: (value: string) => void }) => {
  const [selectedCondition, setSelectedCondition] = React.useState(defaultValue === "cash" ? "cash" : "other");
  const [inputValue, setInputValue] = React.useState(defaultValue !== "cash" ? defaultValue : "");
  const firstUpdate = useRef(true);

  React.useEffect(() => {

    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    if (selectedCondition === "other") {
      return
    }

    onChange(selectedCondition);
  }, [selectedCondition]);

  return (
    <div className="flex items-center space-x-3">
      <ToggleGroup type="single" value={selectedCondition} onValueChange={(value) => setSelectedCondition(value)}>
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
const PrintTaxInvoice = ({
  hasList,
  quotation,
}: {
  hasList: boolean;
  quotation: QuotationWithRelations;

}) => {
  const { invoice } = quotation;

  const lastInvoiceDate = invoice?.date ? new Date(invoice.date) : new Date();

  const [isDone, setIsDone] = React.useState(false);

  const onPrintClick = (date: Date) => {
    setIsDone(false);
    try {
      fetch(`/api/quotations/tax-invoice/${quotation.id}`, {
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
        defaultValue={lastInvoiceDate.toISOString().split("T")[0]}
      />
      <ConfirmActionButton
        isDone={isDone}
        onConfirm={triggerSubmit}
      >
        <Button size={"sm"} variant={"secondary"} type="button">
          <PrinterIcon className="w-4 h-4" />
        </Button>

      </ConfirmActionButton>

    </form>


  );
};

const PrintQuotation = ({
  quotationId,
  hasList,
}: {
  quotationId: number;
  hasList: boolean;
}) => {
  const onPrintClick = (date: Date) => {
    try {
      fetch(`/api/quotations/invoice/${quotationId}`, {
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
          window.URL.revokeObjectURL(url);
          // setTimeout(() => {
          //   window.URL.revokeObjectURL(url); // Clean up the blob URL after it's no longer needed
          // }, 60000); // for example, after 1 minute
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
        defaultValue={new Date().toISOString().split("T")[0]}
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

        // check if value is different from default
        if (purchaseOrderRef === defaultValue) return;

        onUpdate({ purchaseOrderRef });
      }}
    />
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
          {label && <p className="text-sm leading-6 text-gray-600 max-w-[150px] whitespace-pre-wrap">{label}</p>}
          {info && <HoverInfo message={info} />}
        </div>
        <div className="w-[250px]">{children}</div>
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
      <span className="text-orange-500 text-xs">ไม่สามารถลบได้ เนื่องจากมีรายการสินค้าแล้ว</span>
    )
  }

  return (
    <ConfirmActionButton
      onConfirm={handleDelete}
    >
      <Button
        variant="link"
        disabled={hasList}
        className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
        asChild
      >
        {/* <Delete className="w-4 h-4 mr-1" /> */}
        <span>ลบใบเสนอราคา</span>
      </Button>
    </ConfirmActionButton>
  );
}

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

  const { mutate, isPending } = useMutation<
    MutationResponseType,
    Error,
    { quotationId: number, code: string }
  >({
    mutationFn: async (fields) => {
      const res = await QT_SERVICES.put(
        fields.quotationId,
        {
          code: fields.code,
        }
      );
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
      <span className="text-orange-500 text-xs">ไม่สามารถอัพเดทเวอร์ชั่นได้ เนื่องจากมีใบสั่งซื้อแล้ว</span>
    )
  }

  return (
    <ConfirmActionButton
      disabled={isPending}
      onConfirm={handleUpdate}
    >
      <Button
        variant="link"
        className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
      >
        <span>อัพเดทเวอร์ชั่น (R+1)</span>
      </Button>
    </ConfirmActionButton>


  );
}