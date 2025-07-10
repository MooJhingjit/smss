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
import { useQuotationContactModal } from "@/hooks/use-quotation-contact-modal";
import { updateQuotationContact } from "@/actions/quotation/update-contact/index";
import { useAction } from "@/hooks/use-action";

const QuotationContactFormSchema = z.object({
  overrideContactName: z.string().optional(),
  overrideContactEmail: z.string().email().optional().or(z.literal("")),
  overrideContactPhone: z.string().optional(),
});

export const QuotationContactModal = () => {
  const modal = useQuotationContactModal();
  const quotationData = modal.data;

  const form = useForm<z.infer<typeof QuotationContactFormSchema>>({
    resolver: zodResolver(QuotationContactFormSchema),
    defaultValues: {
      overrideContactName: "",
      overrideContactEmail: "",
      overrideContactPhone: "",
    },
  });

  const handleUpdate = useAction(updateQuotationContact, {
    onSuccess: (data) => {
      toast.success("แก้ไขข้อมูลผู้ติดต่อเรียบร้อยแล้ว");
      modal.onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  React.useEffect(() => {
    if (quotationData) {
      form.setValue("overrideContactName", quotationData.overrideContactName || "");
      form.setValue("overrideContactEmail", quotationData.overrideContactEmail || "");
      form.setValue("overrideContactPhone", quotationData.overrideContactPhone || "");
    }
  }, [quotationData, form]);

  function onSubmit(data: z.infer<typeof QuotationContactFormSchema>) {
    if (!quotationData?.id) return;

    handleUpdate.execute({
      id: quotationData.id,
      overrideContactName: data.overrideContactName,
      overrideContactEmail: data.overrideContactEmail,
      overrideContactPhone: data.overrideContactPhone,
    });
  }

  return (
    <ResponsiveDialog
      open={modal.isOpen}
      onOpenChange={modal.onClose}
      title="แก้ไขข้อมูลผู้ติดต่อในใบเสนอราคา"
      description=""
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="overrideContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อผู้ติดต่อ</FormLabel>
                <FormControl>
                  <Input placeholder="ชื่อผู้ติดต่อ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overrideContactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>อีเมล</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="อีเมล" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overrideContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เบอร์โทรศัพท์</FormLabel>
                <FormControl>
                  <Input placeholder="เบอร์โทรศัพท์" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={handleUpdate.isLoading}>
              {handleUpdate.isLoading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
