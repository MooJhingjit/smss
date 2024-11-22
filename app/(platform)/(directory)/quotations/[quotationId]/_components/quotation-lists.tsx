"use client";
import React, { useEffect } from "react";
import { Plus } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import TableLists from "@/components/table-lists";
import { useQuotationListModal } from "@/hooks/use-quotation-list";
import { QuotationListWithRelations } from "@/types";
import { FormTextarea } from "@/components/form/form-textarea";
import { useForm } from "react-hook-form";
import { useAction } from "@/hooks/use-action";
import { updateQuotation } from "@/actions/quotation/update";
import { toast } from "sonner";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { QuotationType } from "@prisma/client";
import ProductBadge from "@/components/badges/product-badge";
import { calculateQuotationItemPrice } from "@/app/services/service.quotation";
import Remarks from "./remarks";

type Props = {
  quotationId: number;
  quotationType: QuotationType;
  data: QuotationListWithRelations[];
  remark: string;
  isLocked: boolean;
};
const columns = [
  { name: "#", key: "index" },
  {
    name: "ชื่อสินค้า/บริการ",
    key: "name",
    render: (item: QuotationListWithRelations) => {
      return (
        <div className="">
          <ProductBadge name={item.product.name} type={item.product.type} />
          {item.subItems && !!JSON.parse(item.subItems).length && (
            <div className="text-xs text-gray-400">
              <span>+</span>
              <span>{JSON.parse(item.subItems).length}</span>
              <span> รายการย่อย</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    name: "ผู้ขาย/ร้านค้า",
    key: "vendor",
    render: (item: QuotationListWithRelations) => {
      return item.product.vendor?.name;
    },
  },
  {
    name: "ต้นทุน",
    key: "cost",
  },
  {
    name: "ราคาต่อหน่วย",
    key: "unitPrice",
    render: (item: QuotationListWithRelations) => {
      return `(+${item.percentage}%) ${item.unitPrice?.toLocaleString()}`;
    },
  },
  { name: "จำนวน", key: "quantity" },

  {
    name: "ภาษี",
    key: "withholdingTaxPercent",
    render: (item: QuotationListWithRelations) => {
      return `(+${item.withholdingTaxPercent}%) ${item.withholdingTax?.toLocaleString()}`;
    },
  },
  {
    name: "ส่วนลด",
    key: "discount",
  },
  {
    name: "ยอดรวม",
    key: "totalPrice",
    render: (item: QuotationListWithRelations) => {
      return item.totalPrice?.toLocaleString();
    },
  },

  // { name: "Price", key: "price" },
  {
    name: "อัพเดทล่าสุด",
    key: "quantity",
    render: (item: QuotationListWithRelations) => {
      const date = new Date(item.updatedAt);
      return date.toLocaleDateString("th-TH");
    },
  },
];

export default function QuotationLists(props: Props) {
  const { data, quotationId, quotationType, remark, isLocked } = props;
  const modal = useQuotationListModal();

  const listLabel = isLocked ? "" : "เพิ่มรายการสินค้า/บริการ";
  return (
    <PageComponentWrapper
      headerTitle={listLabel}
      headerIcon={
        !isLocked && (
          <Button
            onClick={() =>
              !isLocked &&
              modal.onOpen(undefined, {
                quotationRef: { id: quotationId, type: quotationType },
                timestamps: Date.now(),
              })
            }
            disabled={isLocked}
            variant="default"
            className="flex items-center justify-center  h-5 rounded bg-yellow-50 hover:bg-yellow-500 border border-yellow-600"
          >
            <Plus className="w-4 h-4 text-yellow-700  cursor-pointer font-semibold" />
          </Button>
        )
      }
    >
      <div className="overflow-x-scroll md:overflow-auto">
        <TableLists<QuotationListWithRelations>
          columns={columns}
          data={data}
          onManage={
            isLocked
              ? undefined
              : (item) => {
                  return modal.onOpen(item, {
                    quotationRef: { id: item.quotationId, type: quotationType },
                    productRef: {
                      id: item.productId ?? 0,
                      name: item.product?.name ?? "",
                    },
                    timestamps: Date.now(),
                  });
                }
          }
        />
      </div>
      {data.length > 0 && (
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="col-span-5 md:col-span-3 ">
            <Remarks id={quotationId} remark={remark} />
          </div>
          <div className="col-span-5 md:col-span-2">
            <BillingInfo data={data} />
          </div>
        </div>
      )}
    </PageComponentWrapper>
  );
}

type BillingProps = {
  data: QuotationListWithRelations[];
};
const BillingInfo = (props: BillingProps) => {
  const { data } = props;

  // const summary = data.reduce(
  //   (acc, item: QuotationListWithRelations) => {
  //     const discount = item.discount ?? 0;
  //     let price = item.price ?? 0;
  //     const quantity = item.quantity ?? 1;
  //     price = price * quantity;
  //     const totalPrice = item.totalPrice ?? 0;

  //     acc.subtotal += price;
  //     acc.discount += discount;
  //     acc.vat += item.withholdingTax ?? 0;
  //     acc.grandTotal += totalPrice;
  //     return acc;
  //   },
  //   { subtotal: 0, discount: 0, total: 0, vat: 0, grandTotal: 0 },
  // );
  const summary = calculateQuotationItemPrice(data);
  // TODO save to db
  return (
    <div className="bg-gray-100 p-4 w-full sm:rounded-lg sm:px-6">
      <dl className="divide-y divide-gray-200 text-sm">
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">Subtotal</dt>
          <dd className="font-medium text-gray-900">
            {summary.totalPrice.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">Discount</dt>
          <dd className="font-medium text-gray-900">
            {summary.discount.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">7% Vat</dt>
          <dd className="font-medium text-gray-900">
            {summary.tax.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
        <div className="flex items-center justify-between pt-4">
          <dt className="font-medium text-gray-900">Grand Total</dt>
          <dd className="font-medium text-primary-600">
            {summary.grandTotal.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
      </dl>
    </div>
  );
};

// type FormRemark = {
//   id: number;
//   remark: string | null;
// };

// const Remark = ({ id, remark }: { id: number; remark: string | null }) => {
//   // useForm
//   const {
//     register,
//     reset,
//     getValues,
//     formState: { isDirty },
//   } = useForm<FormRemark>({
//     mode: "onChange",
//     defaultValues: {
//       remark: remark ?? "",
//     },
//   });

//   useEffect(() => {
//     reset({ remark: remark ?? "" });
//   }, [remark, reset]);

//   const handleUpdate = useAction(updateQuotation, {
//     onSuccess: (data) => {
//       toast.success("สำเร็จ");
//     },
//     onError: (error) => {
//       toast.error(error);
//     },
//   });

//   const onSubmit = async () => {
//     const remark = getValues("remark") ?? "";
//     handleUpdate.execute({ id, remark });
//   };

//   return (
//     <form action={onSubmit} className="h-full relative">
//       <FormTextarea
//         id="remark"
//         placeholder="หมายเหตุ"
//         className="w-full h-full border p-2 rounded-lg"
//         register={register}
//         rows={12}
//       />
//       <div className="absolute bottom-6 right-2">
//         {isDirty && (
//           <FormSubmit variant="default" className="text-xs">
//             บันทึก
//           </FormSubmit>
//         )}
//       </div>
//     </form>
//   );
// };
