"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUserModal } from "@/hooks/use-user-modal";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { FormInput } from "../form/form-input";
import { FormSubmit } from "../form/form-submit";
import { createUser } from "@/actions/create-user/index";
import { useAction } from "@/hooks/use-action";
import { FormTextarea } from "../form/form-textarea";

export const NewUserModal = () => {
  const modal = useUserModal();

  const { execute, isLoading, fieldErrors } = useAction(createUser, {
    onSuccess: (data) => {
      toast.success('New user created');
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = (formData: FormData) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const fax = formData.get("fax") as string;
    const contact = formData.get("contact") as string;
    const address = formData.get("address") as string;

    execute({ name, email, phone, fax, contact, address });
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="pb-4 space-y-4">
          {/* <Tabs defaultValue="buyer" className="w-full">
            <Label>Type</Label>
            <TabsList className="w-full flex">
              <TabsTrigger className="flex-1" value="buyer">
                Buyer
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="vender">
                Vender
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="admin">
                Admin
              </TabsTrigger>
            </TabsList>
          </Tabs> */}

          <FormInput id="name" label="name" type="text" errors={fieldErrors} />
          <FormInput
            id="email"
            label="email"
            type="email"
            errors={fieldErrors}
          />
          <FormInput
            id="phone"
            label="phone"
            type="text"
            errors={fieldErrors}
          />
          <FormInput id="fax" label="fax" type="text" errors={fieldErrors} />
          <FormInput
            id="contact"
            label="contact"
            type="text"
            errors={fieldErrors}
          />
          <FormTextarea id="address" label="address" errors={fieldErrors} />
          <FormSubmit className="w-full">Create</FormSubmit>
        </form>
      </DialogContent>
    </Dialog>
  );
};
