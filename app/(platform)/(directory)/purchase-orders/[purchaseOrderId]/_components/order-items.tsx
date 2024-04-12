"use client";
import React, { useEffect } from "react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { Input } from "@/components/ui/input";
import {
  PurchaseOrderItemWithRelations,
  PurchaseOrderWithRelations,
} from "@/types";
import TableLists from "@/components/table-lists";
import { usePurchaseOrderListModal } from "@/hooks/use-po-list-modal";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormSubmit } from "@/components/form/form-submit";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { updatePurchaseOrder } from "@/actions/po/update";
import { purchaseOrderItemStatusMapping } from "@/app/config";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BillingInfo from "./billing-info";
import ProductBadge from "@/components/badges/product-badge";

const columns = [
  { name: "#", key: "index" },
  {
    name: "ชื่อสินค้า",
    key: "name",
    render: (item: PurchaseOrderItemWithRelations) => {
      const { name, type } = item;
      return <ProductBadge name={name} type={type} />;
    },
  },
  { name: "ราคา", key: "price" },
  { name: "จำนวน", key: "quantity" },
  {
    name: "รับเข้า",
    key: "quantity",
    render: (item: PurchaseOrderItemWithRelations) => {
      const total = item.items.filter((i) => !!i.serialNumber).length;
      return (
        <p>
          {total}/{item.quantity}
        </p>
      );
    },
  },
  {
    name: "หัก ณ ที่จ่าย",
    key: "withholdingTaxEnabled",
  },
  {
    name: "ออกบิล",
    key: "billedDate",
  },
];

export default function PurchaseOrderItems({
  data,
}: {
  data: PurchaseOrderWithRelations;
}) {
  const { purchaseOrderItems, vendor } = data;
  const modal = usePurchaseOrderListModal();

  if (!purchaseOrderItems) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-sm">ไม่มีข้อมูล</p>
      </div>
    );
  }
  return (
    <PageComponentWrapper
      headerTitle={`รายการสั่งซื้อจาก ${vendor?.name}`}
      headerIcon={
        !data.quotationId && (
          <Button
            onClick={() => modal.onOpen(null, data)}
            variant="secondary"
            className="flex items-center justify-center  h-5 rounded  "
          >
            <Plus className="w-4 h-4 text-gray-400 hover:text-gray-600  cursor-pointer font-semibold" />
          </Button>
        )
      }
    >
      <div className="overflow-x-scroll md:overflow-auto">
        <TableLists<PurchaseOrderItemWithRelations>
          columns={columns}
          data={purchaseOrderItems}
          onManage={(purchaseOrderItem) => {
            modal.onOpen(
              purchaseOrderItem as PurchaseOrderItemWithRelations,
              data
            );
          }}
        />
      </div>
      {data && (
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="col-span-5 md:col-span-3 ">
            <Remarks id={data.id} remark={data.remark} />
            {/* <div className="mt-2 bg-gray-50 p-3 rounded">
              <TaxInfo />
            </div> */}
          </div>
          <div className="col-span-5 md:col-span-2">
            <BillingInfo isManual={!data.quotationId} data={data} />
          </div>
        </div>
      )}
    </PageComponentWrapper>
  );
}

type FormRemark = {
  id: number;
  remark: string | null;
};
const Remarks = ({ id, remark }: { id: number; remark: string | null }) => {
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
    reset({ remark: remark ?? "" });
  }, [remark, reset]);

  const handleUpdate = useAction(updatePurchaseOrder, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = async () => {
    const remark = getValues("remark") ?? "";
    handleUpdate.execute({ id, remark, formType: "remark" });
  };

  return (
    <form action={onSubmit} className="relative">
      <FormTextarea
        id="remark"
        placeholder="หมายเหตุ"
        className="w-full h-full border p-2 rounded-lg"
        register={register}
        rows={12}
      />
      <div className="absolute top-2 right-2">
        {isDirty && (
          <FormSubmit variant="default" className="text-xs">
            Update
          </FormSubmit>
        )}
      </div>
    </form>
  );
};

const TaxInfo = () => {
  return (
    <div className=" grid grid-cols-3 gap-2">
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          ราคาก่อนหักภาษี
        </label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <Input type="text" name="price" id="price" />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 sm:text-sm" id="price-currency">
              บาท
            </span>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          หัก ณ ที่จ่าย 3%
        </label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <Input type="text" name="price" id="price" />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 sm:text-sm" id="price-currency">
              บาท
            </span>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          ราคาหลังจากหัก ณ ที่จ่าย
        </label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <Input type="text" name="price" id="price" />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 sm:text-sm" id="price-currency">
              บาท
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
