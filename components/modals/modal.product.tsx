"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProductModal } from "@/hooks/use-product-modal";
import { FormInput } from "../form/form-input";
import { FormSubmit } from "../form/form-submit";
import { useAction } from "@/hooks/use-action";
import { createProduct } from "@/actions/product/create";
import { toast } from "sonner";
import { updateProduct } from "@/actions/product/update";
import { FormSearchAsync } from "../form/form-search-async";
import { FormTextarea } from "../form/form-textarea";

export const NewProductModal = () => {
  const modal = useProductModal();
  const product = modal.data;

  const handleCreate = useAction(createProduct, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const handleUpdate = useAction(updateProduct, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = (formData: FormData) => {
    const name = formData.get("name") as string;
    const cost = formData.get("cost") as string;
    const percentage = formData.get("percentage") as string;
    const vendor = formData.get("vendor") as string;
    const description = formData.get("description") as string;

    const payload = {
      name,
      vendorId: parseInt(vendor),
      cost: cost,
      percentage: percentage,
      description,
    };

    if (product?.id) {
      handleUpdate.execute({
        id: product.id,
        ...payload,
      });
      return;
    }
    handleCreate.execute({ ...payload });
  };

  const fieldErrors = (product?.id ? handleUpdate : handleCreate).fieldErrors;

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle> {product ? "แก้ไขกลุ่มสินค้า" : "กลุ่มสินค้าใหม่"}</DialogTitle>
          {/* <DialogDescription>Please select the vendor.</DialogDescription> */}
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-2 gap-3">
          <div className="">
            <FormSearchAsync
              id="vendor"
              label="ผู้ขาย/ร้านค้า"
              config={{
                endpoint: "/users",
                params: {
                  role: "vendor",
                },
              }}
              defaultValue={
                product?.vendor
                  ? { value: product.vendor.id, label: product.vendor.name }
                  : null
              }
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="name"
              label="ชื่อสินค้า/บริการ"
              type="text"
              defaultValue={product?.name}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="cost"
              label="ต้นทุน"
              type="number"
              defaultValue={product?.cost}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="percentage"
              label="กำไร(%)"
              type="number"
              defaultValue={product?.percentage}
              errors={fieldErrors}
            />
          </div>
          <div className="col-span-2">
            <FormTextarea
              id="description"
              label="รายละเอียด"
              defaultValue={product?.description ?? ""}
              errors={fieldErrors}
              rows={6}
            />
          </div>
          <div className="col-start-2 col-span-1 flex justify-end">
            <FormSubmit>{product ? "แก้ไข" : "สร้าง"}</FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
