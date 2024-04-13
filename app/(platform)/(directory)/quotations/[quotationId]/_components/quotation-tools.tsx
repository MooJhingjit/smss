"use client";
import React from "react";
import { LockIcon, PrinterIcon, Send, Clock, CheckCircle } from "lucide-react";
import {
  PurchaseOrderPaymentType,
  Quotation,
  QuotationStatus,
  QuotationType,
} from "@prisma/client";
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
import PaymentOptionControl from "@/components/payment-option-control";
import ConfirmActionButton from "@/components/confirm-action";
import StatusBadge from "@/components/badges/status-badge";
import PaymentBadge from "@/components/badges/payment-badge";

type Props = {
  // quotationId: number;
  // type: QuotationType;
  // status: QuotationStatus;
  // isLocked: boolean;
  data: Quotation;
  isAdmin: boolean;
  hasList: boolean;
  paymentType: PurchaseOrderPaymentType;
  paymentDue: string;
};

export default function QuotationTools(props: Props) {
  const { hasList, data, paymentDue, paymentType } = props;
  const isAdmin = props.isAdmin;

  const {
    id: quotationId,
    status,
    isLocked,
    purchaseOrderRef,
    deliveryPeriod,
    validPricePeriod,
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

    // call mutation
    mutate(payloadBody);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 col-span-2 divide-y divide-gray-100 gap-2 ">
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
              <QuotationApprovalButton
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
              <PaymentBadge paymentType={paymentType} paymentDue={paymentDue} />
            </div>
          </ItemList>
        )}

        <ItemList>
          <div className="space-x-8 flex items-center">
            {isAdmin && (
              <PaymentOptionControl
                paymentType={paymentType}
                paymentDue={paymentDue}
                onUpdate={handleItemChange}
              />
            )}
            <div className="h-full">
              <PrintButton quotationId={quotationId} hasList={hasList} />
            </div>
          </div>
        </ItemList>
      </div>
    </div>
  );
}

export const QuotationStatusDropdown = ({
  curStatus,
  onStatusChange,
}: {
  curStatus: QuotationStatus;
  onStatusChange: (status: QuotationStatus) => void;
}) => {
  const allStatus = Object.keys(QuotationStatus) as QuotationStatus[];

  if (curStatus === QuotationStatus.pending_approval) {
    return (
      <div className="flex space-x-3">
        <StatusBadge status={quotationStatusMapping[curStatus].label} />

        <ConfirmActionButton
          onConfirm={() => {
            onStatusChange(QuotationStatus.offer);
          }}
        >
          <Button
            variant="default"
            color="green"
            className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
          >
            <span>อนุมัติ</span>
          </Button>
        </ConfirmActionButton>
        <ConfirmActionButton
          onConfirm={() => {
            onStatusChange(QuotationStatus.open);
          }}
        >
          <Button
            variant="destructive"
            className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
          >
            <span>ยกเลิก</span>
          </Button>
        </ConfirmActionButton>
      </div>
    );
  }

  return (
    <Select onValueChange={onStatusChange}>
      <SelectTrigger className="inline-flex capitalize font-semibold  rounded-md bg-yellow-50 px-2 py-1 text-xs text-yellow-700 border border-yellow-500 items-center">
        <SelectValue placeholder={quotationStatusMapping[curStatus].label} />
      </SelectTrigger>
      <SelectContent className="bg-white text-xs p-2 space-y-2 ">
        {allStatus.map((status, index) => (
          <SelectItem
            value={status}
            key={index}
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
    <div className="col-span-6 pt-2">
      <div className=" flex justify-between items-center px-6 h-full">
        {label && <p className="text-sm leading-6 text-gray-600">{label}</p>}
        {children}
      </div>
    </div>
  );
};

// const PaymentOptionControl = ({
//   paymentType,
//   paymentDue,
//   onUpdate
// }: {
//   paymentType: PurchaseOrderPaymentType;
//   paymentDue: string;
//   onUpdate: (payload: { paymentDue?: string, paymentType?: PurchaseOrderPaymentType }) => void;
// }) => {
//   const [paymentTypeState, setPaymentTypeState] = React.useState(paymentType);

//   const onPaymentTypeUpdate = (type: PurchaseOrderPaymentType) => {

//     setPaymentTypeState(type);
//     if (type === PurchaseOrderPaymentType.cash) {
//       // reset payment due
//       onUpdate({
//         paymentDue: "",
//         paymentType: PurchaseOrderPaymentType.cash
//       });
//     }
//   }

//   return (
//     <div className="flex space-x-2 items-center">
//       {
//         paymentTypeState == PurchaseOrderPaymentType.credit && (
//           <div className="w-[140px] -mt-1">
//             <FormInput
//               id="paymentDue"
//               label=""
//               type="date"
//               placeholder="กำหนดชำระ"
//               defaultValue={paymentDue}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (!value || paymentDue === value) return;
//                 onUpdate({
//                   paymentDue: value,
//                   paymentType: PurchaseOrderPaymentType.credit
//                 });
//               }}
//             />
//           </div>
//         )
//       }
//       <Tabs defaultValue={paymentTypeState} className="w-[150px]">
//         <TabsList className="w-full flex">
//           <TabsTrigger
//             className="flex-1 text-xs"
//             value="cash"
//             onClick={() => onPaymentTypeUpdate("cash")}
//           >
//             เงินสด
//           </TabsTrigger>
//           <TabsTrigger
//             className="flex-1 text-xs"
//             value="credit"
//             onClick={() => onPaymentTypeUpdate("credit")}
//           >
//             เครดิต
//           </TabsTrigger>
//         </TabsList>
//       </Tabs>
//     </div>
//   )
// }
