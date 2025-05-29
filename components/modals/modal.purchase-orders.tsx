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
import { Form } from "@/components/ui/form";
import { usePurchaseOrderModal } from "@/hooks/use-po-modal";
import { useAction } from "@/hooks/use-action";
import { createPurchaseOrder } from "@/actions/po/create";
import { FormSearchAsync } from "../form/form-search-async";
import { User } from "@prisma/client";

const PurchaseOrderFormSchema = z.object({
  vendorId: z.string(),
});

export const NewPurchaseModal = () => {
  const modal = usePurchaseOrderModal();
  const [vendorDetails, setVendorDetails] = React.useState<User | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof PurchaseOrderFormSchema>>({
    resolver: zodResolver(PurchaseOrderFormSchema),
    defaultValues: {
      vendorId: "",
    },
  });

  const handleCreate = useAction(createPurchaseOrder, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
      form.reset();
      router.push(`purchase-orders/${data.id}`);
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  function onSubmit(data: z.infer<typeof PurchaseOrderFormSchema>) {
    handleCreate.execute({
      vendorId: parseInt(data.vendorId),
    });
  }

  console.log("error", form.getValues());

  return (
    <ResponsiveDialog 
      open={modal.isOpen} 
      onOpenChange={modal.onClose}
      title="สร้างใบสั่งซื้อใหม่ (PO)"
      description=""
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 mt-3 ">
          <div className="col-span-1">
            <FormSearchAsync
              id="vendorId"
              label="ผุ้ขาย/ร้านค้า *"
              config={{
                endpoint: "/users",
                params: {
                  role: "vendor",
                },
              }}
              onSelected={(item) => {
                form.setValue("vendorId", item.value ? String(item.value) : "");
                setVendorDetails(item.data);
              }}
            />
          </div>

          {vendorDetails && (
            <div className="col-span-1">
              <VendorInfo data={vendorDetails} />
            </div>
          )}

          <DialogFooter className="col-span-1 flex justify-end">
            <Button type="submit" size="sm">
              สร้าง
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

const VendorInfo = (props: { data: User }) => {
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
