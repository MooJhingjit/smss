"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserModal } from "@/hooks/use-user-modal";
import { createUser } from "@/actions/user/create/index";
import { updateUser } from "@/actions/user/update/index";
import { useAction } from "@/hooks/use-action";

const UserFormSchema = z.object({
  role: z.enum(["buyer", "vendor", "sale", "seller", "admin"]),
  taxId: z.string().optional(),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, {
      message: "Name is too short.",
    }),
  // email: z.union([z.literal(""), z.string().email()]),
  email: z.string().email(),
  phone: z.string().optional(),
  contact: z.string().optional(),
  fax: z.string().optional(),
  address: z.string().optional(),
  password: z.string().optional(),
});

export const NewUserModal = () => {
  const modal = useUserModal();
  const user = modal.data;

  const form = useForm<z.infer<typeof UserFormSchema>>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      role: user?.role ?? "buyer",
      taxId: user?.taxId ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      fax: user?.fax ?? "",
      contact: user?.contact ?? "",
      address: user?.address ?? "",
      password: "",
    },
  });

  const handleCreate = useAction(createUser, {
    onSuccess: (data) => {
      toast.success("New user created");
      modal.onClose();
      form.reset();
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
      form.reset();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  function onSubmit(data: z.infer<typeof UserFormSchema>) {
    // console.log("🚀 ~ onSubmit ~ data:", data);

    // return;
    if (user?.id) {
      // update user
      handleUpdate.execute({
        id: user.id,
        ...data,
      });
      return;
    }
    handleCreate.execute({ ...data });
  }

  // Reset form when user data changes
  React.useEffect(() => {
    if (user) {
      form.reset({
        role: user.role ?? "buyer",
        taxId: user.taxId ?? "",
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        fax: user.fax ?? "",
        contact: user.contact ?? "",
        address: user.address ?? "",
        password: "",
      });
    } else {
      form.reset({
        role: "buyer",
        taxId: "",
        name: "",
        email: "",
        phone: "",
        fax: "",
        contact: "",
        address: "",
        password: "",
      });
    }
  }, [user, form]);

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="max-w-sm sm:max-w-[625px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-3 mt-3"
          >
            <DialogHeader>
              <DialogTitle>{user ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}</DialogTitle>
            </DialogHeader>

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">ประเภท</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="เลือกประเภท" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">เลขผู้เสียภาษี</FormLabel>
                  <FormControl>
                    <Input
                      id="taxId"
                      type="number"
                      placeholder="เลขผู้เสียภาษี"
                      className="text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">ชื่อ</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="ชื่อ"
                      className="text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">อีเมล์</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="อีเมล์"
                      className="text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">เบอร์โทร</FormLabel>
                  <FormControl>
                    <Input
                      id="phone"
                      placeholder="เบอร์โทร"
                      className="text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">แฟกซ์</FormLabel>
                  <FormControl>
                    <Input
                      id="fax"
                      placeholder="แฟกซ์"
                      className="text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">การติดต่อ</FormLabel>
                  <FormControl>
                    <Input
                      id="contact"
                      placeholder="การติดต่อ"
                      className="text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">ที่อยู่</FormLabel>
                    <FormControl>
                      <Textarea
                        id="address"
                        rows={4}
                        placeholder="ที่อยู่"
                        className="resize-none text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <PasswordForm />

            <div className="col-start-2 col-span-1 flex justify-end"></div>

            <DialogFooter className="col-start-2 col-span-1 flex justify-end">
              <Button type="submit" size="sm">
                {user ? "บันทึกการเปลี่ยนแปลง" : "สร้างใหม่"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const PasswordForm = () => {
  const form = useFormContext();

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
    <div className="col-span-2 border border-gray-200 bg-gray-50 p-3 rounded">
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">เปลี่ยนรหัสผ่าน</FormLabel>
            <FormControl>
              <Input
                id="password"
                type="password"
                placeholder="รหัสผ่าน"
                className="w-[200px] text-xs"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
