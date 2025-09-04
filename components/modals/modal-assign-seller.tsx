"use client";
import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSearchAsync } from "@/components/form/form-search-async";
import { useAssignSellerModal } from "@/hooks/use-assign-seller-modal";
import { useMutation } from "@tanstack/react-query";
import { customRevalidatePath } from "@/actions/revalidateTag";

const AssignSellerSchema = z.object({
  sellerId: z.string().min(1, { message: "Seller is required" })
});

export const AssignSellerModal = () => {
  const modal = useAssignSellerModal();

  const form = useForm<z.infer<typeof AssignSellerSchema>>({
    resolver: zodResolver(AssignSellerSchema),
    defaultValues: { sellerId: "" }
  });

  const { mutate, isPending } = useMutation<any, Error, { quotationId: number; sellerId: number }>({
    mutationFn: async (fields) => {
      const res = await fetch(`/api/quotations/${fields.quotationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: fields.sellerId })
      });
      if (!res.ok) {
        const e = await res.text();
        throw new Error(e || "Failed to assign seller");
      }
      return res.json();
    },
    onSuccess: async () => {
      toast.success("อัพเดทผู้ขายสำเร็จ");
      if (modal.data) {
        await customRevalidatePath(`/quotations/${modal.data.id}`);
      }
      modal.onClose();
    },
    onError: (e) => {
      console.error(e);
      toast.error("เกิดข้อผิดพลาด");
    }
  });

  React.useEffect(() => {
    if (modal.isOpen && modal.data) {
      form.reset({
        sellerId: modal.data.sellerId ? String(modal.data.sellerId) : ""
      });
    }
  }, [modal.isOpen, modal.data, form]);

  if (!modal.data) return null;

  function onSubmit(values: z.infer<typeof AssignSellerSchema>) {
    mutate({ quotationId: modal.data!.id, sellerId: parseInt(values.sellerId) });
  }

  return (
    <ResponsiveDialog
      open={modal.isOpen}
      onOpenChange={modal.onClose}
      title="เปลี่ยนผู้ขาย"
      description={`ใบเสนอราคา: ${modal.data.code}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="sellerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ผู้ขาย <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <FormSearchAsync
                    id="assignSeller"
                    config={{
                      endpoint: "/users",
                      params: { role: "seller,admin" }
                    }}
                    placeholder={modal.data?.seller?.name || "เลือกผู้ขาย"}
                    onSelected={(item) => field.onChange(item.value ? String(item.value) : "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
