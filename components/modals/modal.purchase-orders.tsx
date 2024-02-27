"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchaseOrderModal } from "@/hooks/use-po-modal";
import { FormSubmit } from "../form/form-submit";
import { FormSearchAsync } from "../form/form-search-async";
import { User } from "@prisma/client";
import { useState } from "react";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPurchaseOrder } from "@/actions/po/create";

export const NewPurchaseModal = () => {
  const modal = usePurchaseOrderModal();
  const [details, setDetails] = useState<User | null>(null);
  const router = useRouter();

  const handleCreate = useAction(createPurchaseOrder, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
      router.push(`purchase-orders/${data.id}`);
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = async (formData: FormData) => {
    const vendor = formData.get("vendor") as string;

    const payload = {
      vendorId: parseInt(vendor),
    };

    handleCreate.execute({ ...payload });
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>สร้างใบสั่งซื้อใหม่ (PO)</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <FormSearchAsync
              id="vendor"
              label="ผุ้ขาย/ร้านค้า"
              config={{
                endpoint: "/users",
                params: {
                  role: "vendor",
                },
              }}
              onSelected={(item) => {
                setDetails(item.data);
              }}
              // errors={fieldErrors}
            />
          </div>

          {details && (
            <div className="col-span-2">
              <VendorInfo data={details} />
            </div>
          )}
          <div className="col-start-2 col-span-1 flex justify-end">
            <FormSubmit>สร้าง</FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
