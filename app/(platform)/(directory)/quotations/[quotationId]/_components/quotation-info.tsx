"use client";
import {
  paymentTypeMapping,
  quotationStatusMapping,
  quotationTypeMapping,
} from "@/app/config";
import DataInfo from "@/components/data-info";
import { Badge } from "@/components/ui/badge";
import { useQuotationInfoModal } from "@/hooks/use-quotation-info-modal";
import { Quotation } from "@prisma/client";
import {
  CircleEllipsisIcon,
  InfoIcon,
  PlusIcon,
  PrinterIcon,
  ReceiptIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormSearchAsync } from "@/components/form/form-search-async";
import { QuotationWithRelations } from "@/types";
import { attachQuotationToBillGroup } from "@/actions/bill-group/create";
import ConfirmActionButton from "@/components/confirm-action";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { ReceiptPrint } from "@/components/print-receipt";
import { cn } from "@/lib/utils";
import { PDFDateFormat } from "@/app/services/PDF/pdf.helpers";

type Props = {
  data: QuotationWithRelations;
  quotationsGroup: {
    code: string;
    id: number;
    grandTotal: number | null;
  }[];
};

export default function QuotationInfo(props: Readonly<Props>) {
  const modal = useQuotationInfoModal();
  const { data, quotationsGroup } = props;
  console.log("🚀 ~ QuotationInfo ~ data:", data);

  const paymentConditionLabel =
    data.paymentCondition === "cash"
      ? paymentTypeMapping[data.paymentCondition]
      : data.paymentCondition;

  return (
    <DataInfo
      variant="gray"
      CustomComponent={
        <BillController
          currentQuotation={data}
          quotationsGroup={quotationsGroup}
        />
      }
      lists={[
        { label: "ประเภท", value: quotationTypeMapping[data.type] },
        { label: "สถานะ", value: quotationStatusMapping[data.status].label },
        {
          label: "วิธีการชำระเงิน",
          value: paymentTypeMapping[data.paymentType],
        },
        { label: "เงือนไขการชำระเงิน", value: paymentConditionLabel ?? "-" },
        {
          label: "ระยะเวลาการส่งมอบ",
          value: `${data.deliveryPeriod ?? "-"} วัน`,
        },
        {
          label: "ระยะเวลาการยืนราคา",
          value: `${data.validPricePeriod ?? "-"} วัน`,
        },
        { label: "อ้างอิงใบสั่งซื้อ", value: data.purchaseOrderRef ?? "" },
      ]}
      onEdit={() => modal.onOpen(data)}
    />
  );
}

type BillControllerProps = {
  currentQuotation: QuotationWithRelations;
  quotationsGroup: {
    code: string;
    id: number;
    grandTotal: number | null;
  }[];
};

const BillController = ({
  currentQuotation,
  quotationsGroup,
}: BillControllerProps) => {
  const [showFormSearch, setShowFormSearch] = React.useState(false);

  const handleBillGroup = useAction(attachQuotationToBillGroup, {
    onSuccess: () => {
      toast.success("สำเร็จ");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const attachBillGroup = async (quotationId: number) => {
    // bill group id can be null, then create a new bill group
    await handleBillGroup.execute({
      billGroupId: currentQuotation.billGroupId,
      currentQuotationId: currentQuotation.id,
      newQuotationId: quotationId,
    });
  };

  if (!currentQuotation.billGroupId) {
    return (
      <div className="flex items-center space-x-4">
        <Badge variant="default">{currentQuotation.code} </Badge>

        <Popover>
          <PopoverTrigger asChild>
            <CircleEllipsisIcon size={16} className="cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2">
            <ConfirmActionButton
              onConfirm={() => {
                attachBillGroup(currentQuotation.id);
              }}
            >
              <div className="flex space-x-1 items-start">
                <ReceiptIcon size={16} className="mt-1" />
                <div className="w-full text-sm text-left">
                  
                  <p>สร้างกลุ่มบิลใหม่</p>
                  <p className="text-xs text-destructive">เมื่อสร้างแล้วไม่สามรถลบออกได้</p>
                </div>
              </div>
            </ConfirmActionButton>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
  const areQuotationsReady = quotationsGroup.every((qt) => qt.grandTotal) && currentQuotation.grandTotal;
  const contactName = currentQuotation.contact?.name ?? "ลูกค้า";
  const billDateText = currentQuotation?.invoice?.date
    ? new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(currentQuotation?.invoice?.date)
    : null;
  return (
    <div className="border p-3 relative">
      <span className="absolute bg-gray-50 px-2 -top-2 text-xs ">
        กลุ่มบิล ({quotationsGroup.length + 1}){" "}
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="default">
          {!currentQuotation.grandTotal && (
            <InfoIcon size={12} className="mr-1 text-red-300" />
          )}
          <span> {currentQuotation.code}</span>
        </Badge>

        {quotationsGroup.map((qt) => (
          <Link key={qt.id} href={"/quotations/" + qt.id}>
            <Badge
              variant="secondary"
              className={cn("relative flex items-center", {
                // "text-destructive": !qt.grandTotal,
              })}
            >
              {!qt.grandTotal && (
                <InfoIcon size={12} className="mr-1 text-destructive" />
              )}
              <span>{qt.code}</span>
              {/* <span className="absolute top-1 right-0 text-red-600"><MinusCircleIcon size={12} /></span> */}
            </Badge>
          </Link>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <CircleEllipsisIcon size={16} className="cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <div className="grid gap-4">
              <div className="">
                <div className="">
                  <Button
                    variant={"outline"}
                    className="w-full"
                    onClick={() => setShowFormSearch(!showFormSearch)}
                  >
                    <PlusIcon size={12} className="mr-1" />
                    <span className="text-xs">
                      เพิ่มใบเสนอราคาอื่นๆ ของ {contactName}
                    </span>
                  </Button>

                  {showFormSearch && (
                    <div className="mt-2">
                      <FormSearchAsync
                        id="quotationId"
                        required
                        placeholder={`ค้นหาโดยใช้ code`}
                        config={{
                          endpoint: "quotations/group",
                          params: {
                            currentQuotationId: currentQuotation.id,
                            currentContactId: currentQuotation.contactId,
                          },
                          customRender: (data: Quotation) => {
                            return {
                              value: data.id,
                              label: `${data.code}`,
                              data: data,
                            };
                          },
                        }}
                        defaultValue={null}
                        onSelected={(v) => {
                          attachBillGroup(v.value);
                        }}
                      />
                    </div>
                  )}
                </div>
                <Separator className="my-4" />

                {areQuotationsReady ? (
                  <div className="">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <ReceiptIcon size={16} className="mr-2" />
                      <div className="flex items-center space-x-2">
                        <span>ออกบิลชุด</span>
                        {billDateText && (
                          <span className="text-xs text-orange-500">
                            (ออกบิลแล้ว ณ วันที่ {billDateText})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <ReceiptPrint
                        defaultBillDate={
                          currentQuotation?.invoice?.date ?? undefined
                        }
                        endpoint={`/api/quotations/bills/${currentQuotation.billGroupId}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs ">
                    <div className="flex items-center space-x-2 ">
                      <InfoIcon size={16} className="text-destructive" />
                      <span>ไม่สามารถออกบิลได้</span>
                    </div>
                    <span className="pl-6">
                      กรุณาตรวจสอบใบเสนอราคา ที่มีเครื่องหมายกำกับ
                    </span>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {/* <Button onClick={handleCreateBillGroup}>Create Bill Group</Button> */}
      </div>
    </div>
  );
};

// const ReceiptPrint = ({ quotationGroupId, }: {
//   quotationGroupId: number

// }) => {
//   const onPrintClick = (date: Date) => {

//     try {
//       fetch(`/api/quotations/bills/${quotationGroupId}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ date: date.toISOString() }),
//       })
//         .then((res) => res.blob())
//         .then((blob) => URL.createObjectURL(blob))
//         .then((url) => {
//           const a = document.createElement("a");
//           a.href = url;
//           a.target = "_blank"; // Ensure it opens in a new tab
//           document.body.appendChild(a);
//           a.click();
//           document.body.removeChild(a);
//           window.URL.revokeObjectURL(url);
//         });
//     } catch (error) {
//       console.log("error", error);
//     }
//   };

//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);
//         const date = formData.get("bill-date") as string;
//         if (date) {
//           onPrintClick(new Date(date));
//         }
//       }}
//       className="flex w-full max-w-sm items-center space-x-2 "
//     >
//       <Input
//         id="bill-date"
//         name="bill-date"
//         type="date"
//         placeholder="วันที่"
//         defaultValue={new Date().toISOString().split("T")[0]}
//       />
//       <Button size={"sm"} variant={"outline"} type="submit">
//         <PrinterIcon className="w-4 h-4" />
//       </Button>
//     </form>
//   );
// };
