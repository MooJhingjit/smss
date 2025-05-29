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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuotationModal } from "@/hooks/use-quotation-modal";
import { useAction } from "@/hooks/use-action";
import { createQuotation } from "@/actions/quotation/create";
import { FormSearchAsync } from "../form/form-search-async";
import { User } from "@prisma/client";

const QuotationFormSchema = z.object({
  type: z.enum(["product", "service"]),
  buyerId: z.string().min(1, { message: "Customer is required" }),
});

export const NewQuotationModal = () => {
  const router = useRouter();
  const modal = useQuotationModal();
  const [customerDetails, setCustomerDetails] = React.useState<User | null>(null);

  const form = useForm<z.infer<typeof QuotationFormSchema>>({
    resolver: zodResolver(QuotationFormSchema),
    defaultValues: {
      type: "product",
      buyerId: "",
    },
  });

  const handleCreate = useAction(createQuotation, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
      form.reset();
      router.push(`quotations/${data.id}`);
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  function onSubmit(data: z.infer<typeof QuotationFormSchema>) {
    handleCreate.execute({
      type: data.type,
      buyerId: parseInt(data.buyerId),
    });
  }

  const onTypeChange = (value: "product" | "service") => {
    form.setValue("type", value);
  };

  return (
    <ResponsiveDialog 
      open={modal.isOpen} 
      onOpenChange={modal.onClose}
      title="สร้างใบเสนอราคาใหม่"
      description="เลือกชื่อลูกค้า และประเภทของ QT"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเภท</FormLabel>
                  <FormControl>
                    <Tabs value={field.value} onValueChange={(value) => onTypeChange(value as "product" | "service")}>
                      <TabsList className="w-full flex">
                        <TabsTrigger className="flex-1 text-xs" value="product">
                          สินค้า
                        </TabsTrigger>
                        <TabsTrigger className="flex-1 text-xs" value="service">
                          บริการ
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ลูกค้า <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <FormSearchAsync
                      id="customer"
                      config={{
                        endpoint: "/contacts",
                      }}
                      onSelected={(item) => {
                        field.onChange(item.value ? String(item.value) : "");
                        setCustomerDetails(item.data);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {customerDetails && (
              <div className="col-span-1">
                <CustomerInfo data={customerDetails} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={handleCreate.isLoading}>
              {handleCreate.isLoading ? "กำลังสร้าง..." : "สร้าง"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

const CustomerInfo = (props: { data: User }) => {
  const { data } = props;

  return (
    <div className="rounded-md bg-yellow-50 border border-yellow-300 p-2 mt-3">
      <dl className=" space-y-1 text-xs leading-6 text-gray-600">
        <div className="flex space-x-2">
          <dt>Tax Number:</dt>
          <dd className="font-semibold">{data.taxId}</dd>
        </div>
        <div className="flex space-x-2">
          <dt>Email:</dt>
          <dd className="font-semibold">{data.email}</dd>
        </div>
        <div className="flex space-x-2">
          <dt>Phone number:</dt>
          <dd className="font-semibold">{data.phone}</dd>
        </div>
        <div className="flex space-x-2">
          <dt>Fax:</dt>
          <dd className="font-semibold">
            <span className="block">{data.fax}</span>
          </dd>
        </div>
        <div className="flex space-x-2">
          <dt>Address:</dt>
          <dd className="font-semibold">
            <span className="block">{data.address}</span>
          </dd>
        </div>
      </dl>
    </div>
  );
};
