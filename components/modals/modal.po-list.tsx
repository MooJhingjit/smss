"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchaseOrderListModal } from "@/hooks/use-po-list-modal";
import { FormInput } from "../form/form-input";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { FormSubmit } from "../form/form-submit";
import { useAction } from "@/hooks/use-action";
import { updatePurchaseItem } from "@/actions/po-list/update";
import { toast } from "sonner";
import { Item } from "@prisma/client";
import { FormSelect } from "../form/form-select";
import { PackagePlus } from "lucide-react";

type FormInput = {
  name: string;
  price: string;
  quantity: string;
};
export const PurchaseOrderListModal = () => {
  const modal = usePurchaseOrderListModal();
  const defaultData = modal.data;
  const { register, reset } = useForm<FormInput>({
    mode: "onChange",
  });

  useEffect(() => {
    const formData = {
      name: defaultData?.name ?? "",
      price: defaultData?.price ? defaultData.price.toString() : "",
      quantity: defaultData?.quantity ? defaultData.quantity.toString() : "",
    };
    reset(formData);
  }, [defaultData, reset]);

  const handleUpdate = useAction(updatePurchaseItem, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = async (formData: FormData) => {
    if (!defaultData) return;

    const name = formData.get("name") as string;
    handleUpdate.execute({
      id: defaultData.id,
      name,
    });
  };

  const defaultItemLength = !!defaultData?.items.length
    ? defaultData?.items.length
    : defaultData?.quantity;

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>รายการสินค้า</DialogTitle>
          {/* <DialogDescription>Please select the customer.</DialogDescription> */}
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-4 gap-3 mt-3">
          <div className="col-span-4">
            <FormInput
              id="name"
              label="ชื่อสินค้า"
              register={register}
              errors={handleUpdate.fieldErrors}
            />
          </div>

          <div className="col-span-2">
            <FormInput
              id="price"
              label="ราคาต่อหน่วย"
              type="number"
              readOnly
              register={register}
              // errors={fieldErrors}
            />
          </div>
          <div className="col-span-2">
            <FormInput
              id="quantity"
              label="จำนวน"
              type="number"
              readOnly
              register={register}
              defaultValue={defaultData?.quantity}
              // errors={fieldErrors}
            />
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <PackagePlus size={16} className="" />
            <p className="font-medium cursor-default text-xs capitalize">
              รับสินค้าเข้าระบบ
            </p>
          </div>
          <div className="col-span-4">
            <div className="w-full rounded-md bg-green-50 p-4 border border-green-200">
              <div className="grid grid-cols-3 gap-3">
                {defaultItemLength &&
                  Array.from({ length: defaultItemLength }).map((_, index) => (
                    <ItemRow key={index} />
                  ))}
              </div>
            </div>
          </div>
          <div className="col-span-4 flex justify-end">
            <FormSubmit>อัพเดท</FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ItemRow = () => {
  return (
    <>
      <FormInput
        id="serialNumber"
        label="รหัส (SN)"
        type="text"
        // defaultValue={item?.serialNumber}
        // errors={fieldErrors}
      />
      <FormInput
        id="warranty"
        label="ระยะเวลาการรับประกัน"
        type="date"
        // defaultValue={
        //   item?.warrantyDate
        //     ? new Date(item.warrantyDate).toISOString().slice(0, 10)
        //     : undefined
        // }
        // errors={fieldErrors}
      />
      <FormInput
        id="description"
        label="หมายเหตุ"
        type="text"
        // defaultValue={item?.name}
        // errors={fieldErrors}
      />
    </>
  );
};
