"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuotationModal } from "@/hooks/use-quotation-modal";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState } from "react";
import { FormSearchAsync } from "../form/form-search-async";
import { FormSubmit } from "../form/form-submit";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createQuotation } from "@/actions/quotation/create";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";

export const NewQuotationModal = () => {
  const router = useRouter();
  const modal = useQuotationModal();
  const typeRef = useRef<"product" | "service">("product");
  const [customerDetails, setCustomerDetails] = useState<User | null>(null);

  const handleCreate = useAction(createQuotation, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
      router.push(`quotations/${data.id}`);
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = async (formData: FormData) => {
    const customer = formData.get("customer") as string;

    const payload = {
      type: typeRef.current,
      buyerId: parseInt(customer),
    };

    handleCreate.execute({ ...payload });
  };

  const onTypeChange = (value: "product" | "service") => {
    typeRef.current = value;
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>สร้างใบเสนอราคาใหม่</DialogTitle>
          <DialogDescription>เลือกชื่อลูกค้า และประเภทของ QT</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="pb-4 space-y-2">
          <Tabs defaultValue="product" className="w-full">
            <Label className="text-xs">ประเภท</Label>
            <TabsList className="w-full flex">
              <TabsTrigger
                className="flex-1 text-xs"
                value="product"
                onClick={() => onTypeChange("product")}
              >
                สินค้า
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 text-xs"
                value="service"
                onClick={() => onTypeChange("service")}
              >
                บริการ
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="">
            <FormSearchAsync
              id="customer"
              label="ลูกค้า"
              config={{
                endpoint: "/users",
                params: {
                  role: "buyer",
                },
              }}
              onSelected={(item) => {
                setCustomerDetails(item.data);
              }}
              // errors={fieldErrors}
            />
          </div>
          {customerDetails && (
            <div className="">
              <CustomerInfo data={customerDetails} />
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
