"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useItemModal } from "@/hooks/use-item-modal";
import { FormInput } from "../form/form-input";
import { FormSelect } from "../form/form-select";
import { FormSubmit } from "../form/form-submit";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createItem } from "@/actions/item/create";
import { updateItem } from "@/actions/item/update";
import { ItemStatus } from "@prisma/client";

export const ItemModal = () => {
  const modal = useItemModal();
  const item = modal.data;

  const handleCreate = useAction(createItem, {
    onSuccess: (data) => {
      toast.success("New user created");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const handleUpdate = useAction(updateItem, {
    onSuccess: (data) => {
      toast.success("User updated");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = (formData: FormData) => {
    const name = formData.get("name") as string;
    const serialNumber = formData.get("serialNumber") as string;
    const warrantyDate = formData.get("warranty") as string;
    const cost = formData.get("cost") as string;
    const status = formData.get("status") as ItemStatus;


    const payload = {
      productId: 10,
      name,
      serialNumber,
      warrantyDate,
      cost,
      status,
    };

    if (item?.id) {
      // update user
      handleUpdate.execute({
        id: item.id,
        ...payload
      });
      return;
    }
    handleCreate.execute({ ...payload });
  };

  const fieldErrors = (item?.id ? handleUpdate : handleCreate).fieldErrors;
console.log(item?.status)
  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>
            <div className="flex space-x-3">
              <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-blue-700/10">
                PO-0001
              </span>
              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-blue-700/10">
                Wireless Mouse
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="grid grid-cols-2 gap-3 mt-3">
          <FormInput
            id="name"
            label="name"
            type="text"
            defaultValue={item?.name}
            errors={fieldErrors}
          />
          <FormInput
            id="serialNumber"
            label="serial Number"
            type="text"
            defaultValue={item?.serialNumber}
            errors={fieldErrors}

          />
          <FormInput
            id="warranty"
            label="warranty"
            type="date"
            defaultValue={
              item?.warrantyDate
                ? new Date(item.warrantyDate).toISOString().slice(0, 10)
                : undefined
            }
            errors={fieldErrors}

          />
          <FormInput
            id="cost"
            label="Cost"
            type="text"
            defaultValue={item?.cost}
            errors={fieldErrors}
          />
          <FormSelect
            id="status"
            label="Status"
            defaultValue={item?.status ?? undefined}
            options={[
              { id: 'pending', title: 'Pending' },
            ]}
          />
          <div className="col-span-2  flex justify-end">
            <FormSubmit>{item ? "Update Item" : "Create Item"}</FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

