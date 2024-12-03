"use client";
import { paymentTypeMapping, quotationStatusMapping, quotationTypeMapping } from "@/app/config";
import DataInfo from "@/components/data-info";
import { Badge } from "@/components/ui/badge";
import { useQuotationInfoModal } from "@/hooks/use-quotation-info-modal";
import { Quotation } from "@prisma/client";
import { CircleEllipsisIcon, Minus, MinusCircleIcon, PlusIcon, PrinterIcon } from "lucide-react";
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
import { createQuotation } from "@/actions/invoice/create";
type Props = {
  data: Quotation;
};


export default function QuotationInfo(props: Readonly<Props>) {
  const modal = useQuotationInfoModal();
  const { data } = props;

  const paymentConditionLabel = data.paymentCondition === "cash" ? paymentTypeMapping[data.paymentCondition] : data.paymentCondition;

  return (
    <DataInfo
      variant="gray"
      CustomComponent={<BillController currentQuotation={data} />}
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
}

const BillController = ({ currentQuotation }: BillControllerProps) => {
  const handleCreateBillGroup = async () => {
    await createQuotation({ quotationId: currentQuotation.id });
  };

  return (
    <div className="border p-3 relative">
      <span className="absolute bg-gray-50 px-2 -top-2 text-xs ">กลุ่มใบเสนอราคา</span>
      <div className="flex items-center space-x-4">
        <Badge variant="default">{currentQuotation.code}</Badge>

        <Link href={"/quotations/" + currentQuotation.id}>
          <Badge variant="secondary" className="relative pr-6">
            <span>QT20241100011</span>
            <span className="absolute top-1 right-0 text-red-600"><MinusCircleIcon size={12} /></span>
          </Badge>
        </Link>

        <Popover>
          <PopoverTrigger asChild>
            <CircleEllipsisIcon size={16} className="cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-4">
              <div className="">

                <div className="">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <PlusIcon size={16} className="mr-2" />
                    <span>เพิ่มใบ QT</span>
                  </div>
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
                      onSelected={(item: Quotation) => {
                        console.log(item);
                        // setValue("name", item.data.name);
                        // setValue("percentage", item.data.percentage);
                        // setValue("cost", item.data.cost);
                        // setValue("description", item.data.description);
                      }}
                    />
                  </div>


                </div>
                <Separator className="my-4" />

                <div className="">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <PrinterIcon size={16} className="mr-2" />
                    <span>ออกบิล 24 Nov 2024</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
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
                  </div>
                </div>
              </div>

            </div>
          </PopoverContent>
        </Popover>
        <Button onClick={handleCreateBillGroup}>Create Bill Group</Button>
      </div>
    </div>
  )
}