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

export const NewProductModal = () => {
  const modal = useProductModal();
  const product = modal.data;


  const handleCreate = useAction(createProduct, {
    onSuccess: (data) => {
      toast.success("New product created");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const handleUpdate = useAction(updateProduct, {
    onSuccess: (data) => {
      toast.success("Product updated");
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

    if (product?.id) {
      handleUpdate.execute({
        id: product.id,
        name,
        cost,
        percentage
      });
      return;
    }
    handleCreate.execute({ name, cost, percentage });
  };

  const fieldErrors = (product?.id ? handleUpdate : handleCreate).fieldErrors;

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Product</DialogTitle>
          {/* <DialogDescription>Please select the vender.</DialogDescription> */}
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-2 gap-3">

          <div className="">
            <FormInput
              id="vender"
              label="Vender"
              type="text"
              defaultValue={product?.name}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="name"
              label="Name"
              type="text"
              defaultValue={product?.name}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="cost"
              label="Cost"
              type="text"
              defaultValue={product?.name}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="percentage"
              label="Percentage"
              type="text"
              defaultValue={product?.name}
              errors={fieldErrors}
            />
          </div>
          <div className="col-start-2 col-span-1 flex justify-end">
            <FormSubmit>{product ? "Update" : "Create"}</FormSubmit>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
};

