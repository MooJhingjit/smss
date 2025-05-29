"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/responsive-dialog";
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
import { Checkbox } from "../ui/checkbox";
import { useContactModal } from "@/hooks/use-contact-modal";
import { createContact } from "@/actions/contact/create/index";
import { updateContact } from "@/actions/contact/update/index";
import { useAction } from "@/hooks/use-action";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { FormSearchAsync } from "../form/form-search-async";

const ContactFormSchema = z.object({
  taxId: z.string().min(1, { message: "Tax ID is required" }),
  branchId: z.string().optional(),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, {
      message: "Name is too short.",
    }),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  contact: z.string().optional(),
  fax: z.string().optional(),
  address: z.string().optional(),
  isProtected: z.boolean().optional(),
  sellerId: z.string().optional(),
});

export const ContactModal = () => {
  const modal = useContactModal();
  const contact = modal.data;
  const isAdmin = useIsAdmin();

  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      taxId: contact?.taxId ?? "",
      branchId: contact?.branchId ?? "",
      name: contact?.name ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      fax: contact?.fax ?? "",
      contact: contact?.contact ?? "",
      address: contact?.address ?? "",
      isProtected: contact?.isProtected ?? false,
      sellerId: contact?.sellerId ? String(contact.sellerId) : "",
    },
  });

  const handleCreate = useAction(createContact, {
    onSuccess: (data) => {
      toast.success("New contact created");
      modal.onClose();
      form.reset();
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
      form.reset();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  function onSubmit(data: z.infer<typeof ContactFormSchema>) {
    if (contact?.id) {
      handleUpdate.execute({
        id: contact.id,
        ...data,
      });
      return;
    }
    handleCreate.execute({ ...data });
  }

  // Reset form when contact data changes
  React.useEffect(() => {
    if (contact) {
      form.reset({
        taxId: contact.taxId ?? "",
        branchId: contact.branchId ?? "",
        name: contact.name ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        fax: contact.fax ?? "",
        contact: contact.contact ?? "",
        address: contact.address ?? "",
        isProtected: contact.isProtected ?? false,
        sellerId: contact.sellerId ? String(contact.sellerId) : "",
      });
    } else {
      form.reset({
        taxId: "",
        branchId: "",
        name: "",
        email: "",
        phone: "",
        fax: "",
        contact: "",
        address: "",
        isProtected: false,
        sellerId: "",
      });
    }
  }, [contact, form]);

  const assignedTo = contact?.user ?? null;

  return (
    <ResponsiveDialog 
      open={modal.isOpen} 
      onOpenChange={modal.onClose}
      title={contact ? "แก้ไข" : "เพิ่มลูกค้าใหม่"}
      description=""
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {isAdmin && (
              <div className="col-span-1 sm:col-span-2">
                <FormSearchAsync
                  id="sellerId"
                  label="ผู้ดูแล"
                  defaultValue={assignedTo ? {
                    id: assignedTo.id,
                    label: assignedTo?.name,
                  } : undefined}
                  config={{
                    endpoint: "/users",
                    params: {
                      role: "seller",
                    },
                  }}
                  onSelected={(item) => {
                    form.setValue("sellerId", item.id);
                  }}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">เลขผู้เสียภาษี <span className="text-red-500">*</span></FormLabel>
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
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">สาขา</FormLabel>
                  <FormControl>
                    <Input
                      id="branchId"
                      type="number"
                      placeholder="สาขา"
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
                  <FormLabel className="text-xs">ชื่อ <span className="text-red-500">*</span></FormLabel>
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

            <div className="col-span-1 sm:col-span-2">
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

            <DialogFooter className="col-span-1 sm:col-span-2 flex justify-end">
              <Button type="submit" size="sm">
                {contact ? "บันทึกการเปลี่ยนแปลง" : "สร้างใหม่"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
    </ResponsiveDialog>
  );
};
