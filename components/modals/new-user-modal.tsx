"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUserModal } from "@/hooks/use-user-modal";
import { FormInput } from "../form/form-input";
import { FormSubmit } from "../form/form-submit";
import { createUser } from "@/actions/user/create/index";
import { updateUser } from "@/actions/user/update/index";
import { useAction } from "@/hooks/use-action";
import { FormTextarea } from "../form/form-textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FormSelect } from "../form/form-select";

export const NewUserModal = () => {
  const modal = useUserModal();
  const user = modal.data;

  const handleCreate = useAction(createUser, {
    onSuccess: (data) => {
      toast.success("New user created");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const handleUpdate = useAction(updateUser, {
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
    const role = formData.get("role") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const fax = formData.get("fax") as string;
    const contact = formData.get("contact") as string;
    const address = formData.get("address") as string;

    if (user?.id) {
      // update user
      handleUpdate.execute({
        id: user.id,
        role,
        name,
        email,
        phone,
        fax,
        contact,
        address,
      });
      return;
    }
    handleCreate.execute({ role, name, email, phone, fax, contact, address });
  };

  const fieldErrors = (user?.id ? handleUpdate : handleCreate).fieldErrors;

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="max-w-sm sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{user ? "Update User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-2 gap-3 mt-3">
          <div className="col-span-2">
            <FormSelect
              id="role"
              label="Role"
              defaultValue={user?.role ?? undefined}
              options={[
                { id: 'buyer', title: 'Buyer' },
                { id: 'vender', title: 'Vender' },
                { id: 'sale', title: 'Sale' },
                { id: 'admin', title: 'Admin' },
              ]}
            />
          </div>
          <FormInput
            id="name"
            label="name"
            type="text"
            defaultValue={user?.name}
            errors={fieldErrors}
          />
          <FormInput
            id="email"
            label="email"
            type="email"
            defaultValue={user?.email}
            errors={fieldErrors}
          />
          <FormInput
            id="phone"
            label="phone"
            type="text"
            defaultValue={user?.phone || undefined}
            errors={fieldErrors}
          />
          <FormInput
            id="fax"
            label="fax"
            type="text"
            defaultValue={user?.fax || undefined}
            errors={fieldErrors}
          />
          <FormInput
            id="contact"
            label="contact"
            type="text"
            defaultValue={user?.contact || undefined}
            errors={fieldErrors}
          />
          <div className="col-span-2 ...">
            <FormTextarea
              id="address"
              rows={4}
              label="address"
              defaultValue={user?.address || undefined}
              errors={fieldErrors}
            />
          </div>

          <div className="col-start-2 col-span-1 flex justify-end">
            <FormSubmit>{user ? "Update User" : "Create User"}</FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
