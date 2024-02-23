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

type Props = {
  quotationId: number;
  data: QuotationListWithRelations[];
  remark: string;
  isLocked: boolean;
};
const columns = [
  { name: "#", key: "index" },
  {
    name: "ชื่อสินค้า/บริการ", key: "name",
    render: (item: QuotationListWithRelations) => {
      return <div className="">
        <p className="text-sm font-semibold">{item.product.name}</p>
        {
          item.subItems && !!JSON.parse(item.subItems).length && (
            <div className="text-xs text-gray-400">
              <span>+</span>
              <span>{JSON.parse(item.subItems).length}</span>
              <span> รายการย่อย</span>
            </div>
          )
        }
      </div>
    },
  },
  {
    name: "ผู้ขาย", key: "vendor",
    render: (item: QuotationListWithRelations) => {
      return item.product.vendor?.name;
    },
  },
  {
    name: "ต้นทุน", key: "cost"
  },
  {
    name: "ราคาต่อหน่วย", key: "unitPrice",
    render: (item: QuotationListWithRelations) => {
      return `(+${item.percentage}%) ${item.unitPrice}`;
    },
  },
  { name: "จำนวน", key: "quantity" },



  {
    name: "ภาษี", key: "withholdingTaxPercent",
    render: (item: QuotationListWithRelations) => {
      return `(+${item.withholdingTaxPercent}%) ${item.withholdingTax}`;
    },
  },
  {
    name: "ส่วนลด", key: "discount",
  },
  {
    name: "ยอดรวม", key: "totalPrice",
    render: (item: QuotationListWithRelations) => {
      return item.totalPrice;
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
  const { data, quotationId, remark, isLocked } = props;
  const modal = useQuotationListModal();

  const listLabel = isLocked ? "" : "เพิ่มรายการสินค้า/บริการ";
  return (
    <PageComponentWrapper
      headerTitle={listLabel}
      headerIcon={
        !isLocked && (
          <Button
            onClick={() =>
              !!isLocked && modal.onOpen(undefined, {
                quotationRef: { id: quotationId },
                timestamps: Date.now()
              })
            }
            disabled={isLocked}
            variant="secondary"
            className="flex items-center justify-center  h-5 rounded  "
          >
            <Plus
              className="w-4 h-4 text-gray-400 hover:text-gray-600  cursor-pointer font-semibold"
            />
          </Button>
        )


      }
    >
      <div className="overflow-x-scroll md:overflow-auto">
        <TableLists<QuotationListWithRelations>
          columns={columns}
          data={data}
          onManage={isLocked ? undefined : (item) =>
            modal.onOpen(item, {
              quotationRef: { id: item.quotationId },
              productRef: { id: item.productId, name: item.product.name },
              timestamps: Date.now(),
            })
          }
        />
      </div>
      {
        data.length > 0 && (
          <div className="grid grid-cols-5 gap-4 mt-4">
            <div className="col-span-5 md:col-span-3 ">
              <Remark id={quotationId} remark={remark} />
            </div>
            <div className="col-span-5 md:col-span-2">
              <BillingInfo data={data} />
            </div>
          </div>
        )
      }
    </PageComponentWrapper >
  );
}

type BillingProps = {
  data: QuotationListWithRelations[];
};
const BillingInfo = (props: BillingProps) => {

  const { data } = props;

  const summary = data.reduce(
    (acc, item: QuotationListWithRelations) => {
      const discount = item.discount ?? 0;
      let price = item.price ?? 0
      const quantity = item.quantity ?? 1;
      price = price * quantity;
      const totalPrice = item.totalPrice ?? 0;

      acc.subtotal += price
      acc.discount += discount;
      acc.vat += item.withholdingTax ?? 0;
      acc.totalPrice += totalPrice;
      return acc;
    },
    { subtotal: 0, discount: 0, total: 0, vat: 0, totalPrice: 0 },);

  // TODO save to db
  return (
    <div className="bg-gray-100 p-4 w-full sm:rounded-lg sm:px-6">
      <dl className="divide-y divide-gray-200 text-sm">
        <div className="flex items-center justify-between py-4">
          <dt className="text-gray-600">Subtotal</dt>
          <dd className="font-medium text-gray-900">{
            summary.subtotal.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })
          }</dd>
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
            {summary.vat.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
        <div className="flex items-center justify-between pt-4">
          <dt className="font-medium text-gray-900">Grand Total</dt>
          <dd className="font-medium text-primary-600">
            {summary.totalPrice.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </dd>
        </div>
      </dl>
    </div>
  );
};


type FormRemark = {
  id: number;
  remark: string | null;
};

const Remark = ({ id, remark }: { id: number, remark: string | null }) => {

  // useForm
  const {
    register,
    watch,
    reset,
    getValues,
    formState: { errors, isValid, isDirty },
  } = useForm<FormRemark>({
    mode: "onChange",
    defaultValues: {
      remark: remark ?? "",
    },
  });

  useEffect(() => {
    reset({ remark: remark ?? "" })
  }, [remark, reset])

  const handleUpdate = useAction(updateQuotation, {
    onSuccess: (data) => {
      toast.success("Quotation Updated");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = async () => {
    const remark = getValues("remark") ?? "";
    handleUpdate.execute({ id, remark });
  };

  return (
    <form action={onSubmit} className="h-full relative">
      <FormTextarea
        id="remark"
        placeholder="Remark"
        className="w-full h-full border p-2 rounded-lg"
        register={register}
        rows={12}
      />
      <div className="absolute bottom-2 right-2">
        {
          isDirty && (
            <FormSubmit variant="default" className="text-xs">
              Update
            </FormSubmit>
          )
        }
      </div>
    </form>
  );
};
