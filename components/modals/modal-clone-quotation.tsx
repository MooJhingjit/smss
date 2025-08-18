"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { useCloneQuotationModal } from "@/hooks/use-clone-quotation-modal";
import { FormSearchAsync } from "../form/form-search-async";
import { useMutation } from "@tanstack/react-query";

const CloneQuotationFormSchema = z.object({
  contactId: z.string().min(1, { message: "Contact is required" }),
  sellerId: z.string().min(1, { message: "Seller is required" }),
});

export const CloneQuotationModal = () => {
  const router = useRouter();
  const modal = useCloneQuotationModal();

  const form = useForm<z.infer<typeof CloneQuotationFormSchema>>({
    resolver: zodResolver(CloneQuotationFormSchema),
    defaultValues: {
      contactId: "",
      sellerId: "",
    },
  });

  const { mutate, isPending } = useMutation<
    any,
    Error,
    { quotationId: number; contactId: number; sellerId: number }
  >({
    mutationFn: async (fields) => {
      const res = await fetch(`/api/quotations/clone/${fields.quotationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: fields.contactId,
          sellerId: fields.sellerId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to clone quotation");
      }

      return res.json();
    },
    onSuccess: async (response) => {
      toast.success("คัดลอกใบเสนอราคาสำเร็จ");

      // Close modal, reset form and redirect to new quotation
      modal.onClose();
      form.reset();
      router.push(`/quotations/${response.data.quotationId}`);
    },
    onError: (error) => {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการคัดลอก");
    },
  });

  function onSubmit(data: z.infer<typeof CloneQuotationFormSchema>) {
    if (!modal.data) return;

    mutate({
      quotationId: modal.data.id,
      contactId: parseInt(data.contactId),
      sellerId: parseInt(data.sellerId),
    });
  }

  // Reset form when modal opens with default values from original quotation
  React.useEffect(() => {
    console.log("🚀 ~ CloneQuotationModal ~ modal.data:", modal.data)
    if (modal.isOpen && modal.data) {
        form.reset({
            contactId: modal.data.contactId?.toString() || "",
            sellerId: modal.data.sellerId?.toString() || "",
        });
    //   form.setValue("sellerId", modal.data.sellerId?.toString() || "");
    }
  }, [modal.isOpen, modal.data, form]);

  if (!modal.data) return null;

  return (
    <ResponsiveDialog
      open={modal.isOpen}
      onOpenChange={modal.onClose}
      title="คัดลอกใบเสนอราคา"
      description={`คัดลอกจาก: ${modal.data.code}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ลูกค้า (บริษัท) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <FormSearchAsync
                      id="contact"
                      config={{
                        endpoint: "/contacts",
                      }}
                      placeholder={modal.data?.contact?.name || "เลือกลูกค้า"}
                      onSelected={(item) => {
                        field.onChange(item.value ? String(item.value) : "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ผู้ขาย <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <FormSearchAsync
                      id="seller"
                      config={{
                        endpoint: "/users",
                        params: {
                          role: "seller,admin",
                        },
                      }}
                      placeholder={modal.data?.seller?.name || "เลือกผู้ขาย"}
                      onSelected={(item) => {
                        field.onChange(item.value ? String(item.value) : "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            {/* <Button type="button" variant="outline" onClick={modal.onClose}>
              ยกเลิก
            </Button> */}
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังคัดลอก..." : "คัดลอก"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
