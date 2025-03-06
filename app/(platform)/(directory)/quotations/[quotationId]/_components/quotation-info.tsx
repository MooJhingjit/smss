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
  LayersIcon,
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
import { Input } from "@/components/ui/input";

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

  const paymentConditionLabel =
    data.paymentCondition === "cash"
      ? paymentTypeMapping[data.paymentCondition]
      : data.paymentCondition
        ? `${data.paymentCondition} วัน`
        : "-";

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
        { label: "เงื่อนไขการชำระเงิน", value: `${paymentConditionLabel}` },
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
  const [billGroupDate, setBillGroupDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );

  const handleBillGroup = useAction(attachQuotationToBillGroup, {
    onSuccess: () => {
      toast.success("สำเร็จ");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const attachBillGroup = async (quotationId: number) => {

    if (billGroupDate === "") {
      toast.error("กรุณาเลือกวันที่ออกกลุ่มบิล");
      return;
    }

    // bill group id can be null, then create a new bill group
    const payload = {
      billGroupId: currentQuotation.billGroupId,
      currentQuotationId: currentQuotation.id,
      newQuotationId: quotationId,
      billGroupDate: billGroupDate,
    }

    await handleBillGroup.execute(payload);
  };

  if (!currentQuotation.billGroupId) {
    return (
      <div className="flex items-center space-x-4">
        <Badge variant="default">{currentQuotation.code} </Badge>
        <Popover>
          <PopoverTrigger asChild>
            <CircleEllipsisIcon size={16} className="cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex space-x-2 items-center justify-end">
              <div className="">
                <div className="flex space-x-1 items-start gap-2 px-2">
                  <LayersIcon size={20} className="mt-1" />
                  <div className="w-full text-sm text-left">
                    <p>สร้างกลุ่มบิลใหม่</p>
                    <p className="text-xs text-orange-500 whitespace-nowrap">
                      - เมื่อสร้างแล้วไม่สามรถลบออกได้
                    </p>
                  </div>
                </div>

                <div className="flex justify-center space-x-2 mt-2">
                  <Input
                    id="bill_group_date"
                    name="bill_group_date"
                    type="date"
                    placeholder="วันที่ออกบิล"
                    onChange={(e) => setBillGroupDate(e.target.value)}
                    defaultValue={billGroupDate}
                  />
                  <ConfirmActionButton
                    onConfirm={() => {
                      attachBillGroup(currentQuotation.id);
                    }}
                  >
                    <Button className="flex justify-center items-center space-x-1 h-9">
                      <PlusIcon size={12} className="mr-1" />
                      <p>สร้าง</p>
                    </Button>
                  </ConfirmActionButton>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
  const areQuotationsReady =
    quotationsGroup.every((qt) => qt.grandTotal) && currentQuotation.grandTotal;

  const contactName = currentQuotation.contact?.name ?? "ลูกค้า";
  const invDate = currentQuotation?.invoice?.date
    ? new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(currentQuotation?.invoice?.date)
    : null;

  const allQuotations = [currentQuotation, ...quotationsGroup].sort(
    (a, b) => a.id - b.id
  );
  const billGroupCode = currentQuotation?.billGroup?.code ?? "";
  const defaultInvoiceDate = currentQuotation?.billGroup?.date
  return (
    <div className="border p-3 relative">
      <div className="absolute bg-gray-50 px-2 -top-2 text-xs ">
        <div className="flex space-x-2 items-center justify-center">
          <p> กลุ่มบิล</p>
          {billGroupCode && <p className="font-semibold">{billGroupCode}</p>}
          {/* <p> ({quotationsGroup.length + 1})</p> */}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {/* <Badge variant="default">
          {!currentQuotation.grandTotal && (
            <InfoIcon size={12} className="mr-1 text-red-300" />
          )}
          <span> {currentQuotation.code}</span>
        </Badge> */}

        {allQuotations.map((qt) => (
          <Link key={qt.id} href={"/quotations/" + qt.id}>
            <Badge
              variant={qt.id === currentQuotation.id ? "default" : "secondary"}
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
                  {invDate ? (
                    <p className="text-xs text-orange-500 flex items-center">
                      <InfoIcon size={12} className="mr-1" />
                      <span className="text-xs">
                        ไม่สามารถเพิ่มใบเสนอราคาอื่นๆ ได้ เนื่องจากออกบิลแล้ว
                      </span>
                    </p>
                  ) : (
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
                  )}

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
                    <div className="text-sm text-muted-foreground flex ">
                      <ReceiptIcon size={16} className="mr-2" />
                      <div className="">
                        <p>ออกใบแจ้งหนี้/ใบวางบิล</p>
                        {invDate ? (
                          <>
                            <p className="text-xs text-orange-500">
                              - ออกบิลแล้ว ณ วันที่ {invDate}
                            </p>
                            <p className="text-xs text-orange-500">
                              - สามารถแก้ไขวันที่ได้ แต่เลข INV จะไม่เปลี่ยน
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-orange-500">
                              - ออกใบแจ้งหนี้/ใบวางบิล ทั้งหมดในกลุ่ม *ครั้งแรก

                            </p>
                            <p className="text-xs text-orange-500">
                              - เลข INV จะไม่เปลี่ยน หากมีการแก้ไขวันที่ในการออกครั้งถัดไป
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <ReceiptPrint
                        defaultBillDate={
                          currentQuotation?.invoice?.date ?? defaultInvoiceDate ?? undefined
                        }
                        endpoint={`/api/quotations/bills/${currentQuotation.billGroupId}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs ">
                    <div className="flex space-x-2 ">
                      <InfoIcon size={16} className="text-destructive" />
                      <div className="pl-2">
                        <p>ไม่สามารถออกบิลได้</p>
                        <p className="">
                          กรุณาตรวจสอบใบเสนอราคา ที่มีเครื่องหมายกำกับ
                        </p>
                        <p className="text-xs text-orange-500 mt-1">
                          - กรณี สินค้า ต้องสร้างใบ PO ก่อน (เพื่อยืนยันยอดรวม)
                        </p>
                        <p className="text-xs text-orange-500">
                          - กรณี บริการ ต้องยืนยันยอดรวมก่อน
                        </p>
                      </div>
                    </div>
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
