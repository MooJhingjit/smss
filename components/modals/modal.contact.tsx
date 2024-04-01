"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useContactModal } from "@/hooks/use-contact-modal";
import { FormInput } from "../form/form-input";
import { FormSubmit } from "../form/form-submit";
import { createContact } from "@/actions/contact/create/index";
import { updateContact } from "@/actions/contact/update/index";
import { useAction } from "@/hooks/use-action";
import { FormTextarea } from "../form/form-textarea";
import { Checkbox } from "../ui/checkbox";
import { useSession } from "next-auth/react";
import { classNames } from "@/lib/utils";

export const ContactModal = () => {
  const modal = useContactModal();
  const contact = modal.data;
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const handleCreate = useAction(createContact, {
    onSuccess: (data) => {
      toast.success("New contact created");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const handleUpdate = useAction(updateContact, {
    onSuccess: (data) => {
      toast.success("Contact updated");
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
    const contactText = formData.get("contact") as string;
    const address = formData.get("address") as string;
    const taxId = formData.get("taxId") as string;
    const isProtected = formData.get("isProtected") as string;
    const payload = {
      taxId,
      name,
      email,
      phone,
      fax,
      contact: contactText,
      address,
      isProtected: isProtected === "on",
    };
    if (contact?.id) {
      // update user
      handleUpdate.execute({
        id: contact.id,
        ...payload,
      });
      return;
    }
    handleCreate.execute({ ...payload });
  };

  const fieldErrors = (contact?.id ? handleUpdate : handleCreate).fieldErrors;

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="max-w-sm sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{contact ? "แก้ไข" : "เพิ่มลูกค้าใหม่"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-2 gap-3 mt-3">
          <FormInput
            id="taxId"
            label="เลขผู้เสียภาษี"
            type="number"
            defaultValue={contact?.taxId}
            errors={fieldErrors}
          />
          <FormInput
            id="name"
            label="ชื่อ"
            type="text"
            defaultValue={contact?.name}
            errors={fieldErrors}
          />
          <FormInput
            id="email"
            label="อีเมล์"
            type="email"
            defaultValue={contact?.email}
            errors={fieldErrors}
          />
          <FormInput
            id="phone"
            label="เบอร์โทร"
            type="text"
            defaultValue={contact?.phone ?? undefined}
            errors={fieldErrors}
          />
          <FormInput
            id="fax"
            label="แฟกซ์"
            type="text"
            defaultValue={contact?.fax ?? undefined}
            errors={fieldErrors}
          />
          <FormInput
            id="contact"
            label="การติดต่อ"
            type="text"
            defaultValue={contact?.contact ?? undefined}
            errors={fieldErrors}
          />
          <div className="col-span-2">
            <FormTextarea
              id="address"
              rows={4}
              label="ที่อยู่"
              defaultValue={contact?.address ?? undefined}
              errors={fieldErrors}
            />
          </div>

          {isAdmin && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isProtected"
                name="isProtected"
                defaultChecked={contact?.isProtected}
              />
              <label
                htmlFor="isProtected"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                ไม่อนุญาตให้เซลล์เข้าถึง
              </label>
            </div>
          )}

          <div
            className={classNames(!isAdmin && "col-span-2", "flex justify-end")}
          >
            <FormSubmit>
              {contact ? "บันทึกการเปลี่ยนแปลง" : "สร้างใหม่"}
            </FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
