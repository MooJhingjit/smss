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
import { FormSelect } from "../form/form-select";
import { UserRole } from "@prisma/client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
    const role = formData.get("role") as UserRole;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const fax = formData.get("fax") as string;
    const contact = formData.get("contact") as string;
    const address = formData.get("address") as string;
    const taxId = formData.get("taxId") as string;
    const password = formData.get("password") as string;

    const payload = {
      role,
      taxId,
      name,
      email,
      phone,
      fax,
      contact,
      address,
      password,
    };
    if (user?.id) {
      // update user
      handleUpdate.execute({
        id: user.id,
        ...payload,
      });
      return;
    }
    handleCreate.execute({ ...payload });
  };

  const fieldErrors = (user?.id ? handleUpdate : handleCreate).fieldErrors;

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="max-w-sm sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{user ? "แก้ไข" : "เพิ่มผู้ใช้ใหม่"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-2 gap-3 mt-3">
          <div className="col-span-2">
            <FormSelect
              id="role"
              label="ประเภท"
              // disabled={true}
              defaultValue={user?.role ?? undefined}
              options={[
                { id: "buyer", title: "Buyer" },
                { id: "vendor", title: "Vendor" },
                { id: "seller", title: "Seller" },
                { id: "admin", title: "Admin" },
              ]}
            />
          </div>
          <FormInput
            id="taxId"
            label="เลขผู้เสียภาษี"
            type="number"
            defaultValue={user?.taxId}
            errors={fieldErrors}
          />
          <FormInput
            id="name"
            label="ชื่อ"
            type="text"
            defaultValue={user?.name}
            errors={fieldErrors}
          />
          <FormInput
            id="email"
            label="อีเมล์"
            type="email"
            defaultValue={user?.email}
            errors={fieldErrors}
          />
          <FormInput
            id="phone"
            label="เบอร์โทร"
            type="text"
            defaultValue={user?.phone ?? undefined}
            errors={fieldErrors}
          />
          <FormInput
            id="fax"
            label="แฟกซ์"
            type="text"
            defaultValue={user?.fax ?? undefined}
            errors={fieldErrors}
          />
          <FormInput
            id="contact"
            label="การติดต่อ"
            type="text"
            defaultValue={user?.contact ?? undefined}
            errors={fieldErrors}
          />
          <div className="col-span-2 ...">
            <FormTextarea
              id="address"
              rows={4}
              label="ที่อยู่"
              defaultValue={user?.address ?? undefined}
              errors={fieldErrors}
            />
          </div>

          <PasswordForm fieldErrors={fieldErrors} />

          <div className="col-start-2 col-span-1 flex justify-end">
            <FormSubmit>
              {user ? "บันทึกการเปลี่ยนแปลง" : "สร้างใหม่"}
            </FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PasswordForm = ({ fieldErrors }: { fieldErrors: any }) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!showPassword) {
    return (
      <div className="col-span-2 flex">
        <button
          type="button"
          onClick={() => setShowPassword(true)}
          className="text-gray-500 hover:underline text-xs space-x-2 flex items-center hover:text-gray-700 cursor-pointer"
        >
          <span>เปลี่ยนรหัสผ่าน</span>
          <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  }
  return (
    <div className=" col-span-2 border border-gray-200 bg-gray-50 p-3 rounded ">
      <FormInput
        id="password"
        label="เปลี่ยนรหัสผ่าน"
        type="password"
        className="w-[200px]"
        errors={fieldErrors}
      />
    </div>
  );
};
