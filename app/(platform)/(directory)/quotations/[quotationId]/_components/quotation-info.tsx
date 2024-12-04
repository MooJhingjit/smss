"use client";
import { paymentTypeMapping, quotationStatusMapping, quotationTypeMapping } from "@/app/config";
import DataInfo from "@/components/data-info";
import { Badge } from "@/components/ui/badge";
import { useQuotationInfoModal } from "@/hooks/use-quotation-info-modal";
import { Quotation } from "@prisma/client";
import { CircleEllipsisIcon, Minus, MinusCircleIcon, PlusIcon, PrinterIcon, ReceiptIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormSearchAsync } from "@/components/form/form-search-async";
import { ProductWithRelations } from "@/types";
import { Input } from "@/components/ui/input";
import { attachQuotationToBillGroup } from "@/actions/bill-group/create";
import ConfirmActionButton from "@/components/confirm-action";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";

type Props = {
  data: Quotation;
  quotationsGroup: {
    code: string;
    id: number;
  }[]
};


export default function QuotationInfo(props: Readonly<Props>) {
  const modal = useQuotationInfoModal();
  const { data, quotationsGroup } = props;
  console.log("🚀 ~ QuotationInfo ~ data:", data)

  const paymentConditionLabel = data.paymentCondition === "cash" ? paymentTypeMapping[data.paymentCondition] : data.paymentCondition;

  return (
    <DataInfo
      variant="gray"
      CustomComponent={<BillController currentQuotation={data} quotationsGroup={quotationsGroup} />}
      lists={[
        { label: "ประเภท", value: quotationTypeMapping[data.type] },
        { label: "สถานะ", value: quotationStatusMapping[data.status].label },
        { label: "วิธีการชำระเงิน", value: paymentTypeMapping[data.paymentType] },
        { label: "เงือนไขการชำระเงิน", value: paymentConditionLabel ?? "-" },
        { label: "ระยะเวลาการส่งมอบ", value: `${data.deliveryPeriod ?? "-"} วัน` },
        { label: "ระยะเวลาการยืนราคา", value: `${data.validPricePeriod ?? "-"} วัน` },
        { label: "อ้างอิงใบสั่งซื้อ", value: data.purchaseOrderRef ?? "" },
      ]}
      onEdit={() => modal.onOpen(data)}
    />
  );
}




type BillControllerProps = {
  currentQuotation: Quotation;
  quotationsGroup: {
    code: string;
    id: number;
  }[]
}

const BillController = ({ currentQuotation, quotationsGroup }: BillControllerProps) => {

  const [showFormSearch, setShowFormSearch] = React.useState(false);

  const handleBillGroup = useAction(attachQuotationToBillGroup, {
    onSuccess: () => {
      toast.success('สำเร็จ');
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
      newQuotationId: quotationId
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
          <PopoverContent className="w-52">
            <ConfirmActionButton
              onConfirm={() => {
                attachBillGroup(currentQuotation.id)
              }}
            >
              <div className="flex space-x-1 items-center">
                <ReceiptIcon size={16} />
                <div
                  className="w-full text-sm"
                >
                  <p>สร้างกลุ่มบิลใหม่</p>
                </div>
              </div>
            </ConfirmActionButton>
          </PopoverContent>
        </Popover>

      </div>
    )
  }


  return (
    <div className="border p-3 relative">
      <span className="absolute bg-gray-50 px-2 -top-2 text-xs ">กลุ่มใบเสนอราคา ({quotationsGroup.length + 1}) </span>
      <div className="flex items-center space-x-4">
        <Badge variant="default">{currentQuotation.code}</Badge>

        {quotationsGroup.map((qt) => (
          <Link key={qt.id} href={"/quotations/" + qt.id}>
            <Badge variant="secondary" className="relative">
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
                  <Button variant={"outline"}
                    className="w-full"
                    onClick={() => setShowFormSearch(!showFormSearch)}
                  >
                    <PlusIcon size={12} className="mr-1" />
                    <span className="text-xs">QT</span>
                  </Button>

                  {showFormSearch && (
                    <div className="mt-2">
                      <FormSearchAsync
                        id="quotationId"
                        required
                        config={{
                          endpoint: "quotations/group",
                          params: {
                            'currentQuotationId': currentQuotation.id
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

                <div className="">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <PrinterIcon size={16} className="mr-2" />
                    <span>ออกบิล</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <ReceiptPrint quotationGroupId={currentQuotation.billGroupId} />
                  </div>
                </div>
              </div>

            </div>
          </PopoverContent>
        </Popover>
        {/* <Button onClick={handleCreateBillGroup}>Create Bill Group</Button> */}
      </div>
    </div>
  )
}

const ReceiptPrint = ({ quotationGroupId, }: {
  quotationGroupId: number

}) => {
  const onPrintClick = (date: Date) => {

    try {
      fetch(`/api/quotations/bills/${quotationGroupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: date.toISOString() }),
      })
        .then((res) => res.blob())
        .then((blob) => URL.createObjectURL(blob))
        .then((url) => {
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank"; // Ensure it opens in a new tab
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
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
        const date = formData.get("bill-date") as string;
        if (date) {
          onPrintClick(new Date(date));
        }
      }}
      className="flex w-full max-w-sm items-center space-x-2 "
    >
      <Input
        id="bill-date"
        name="bill-date"
        type="date"
        placeholder="วันที่"
        defaultValue={new Date().toISOString().split("T")[0]}
      />
      <Button size={"sm"} variant={"outline"} type="submit">
        <PrinterIcon className="w-4 h-4" />
      </Button>
    </form>
  );
};
