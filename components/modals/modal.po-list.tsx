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

type FormInput = {
  name: string;
  price: string;
  quantity: string;
};
export const PurchaseOrderListModal = () => {
  const modal = usePurchaseOrderListModal();
  const defaultData = modal.data;

  const {
    register,
    reset,
  } = useForm<FormInput>({
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
      toast.success("List updated");
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

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>ระบุรายการสินค้า</DialogTitle>
          {/* <DialogDescription>Please select the customer.</DialogDescription> */}
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-4 gap-3 mt-3">
          <div className="col-span-4">
            <FormInput
              id="name"
              label="ชื่อสินค้า/บริการ"
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
          <div className="col-span-4 flex justify-end">
            <FormSubmit>อัพเดท</FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
