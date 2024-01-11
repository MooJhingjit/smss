"use client";
import { redirect } from "next/navigation";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePurchaseModal } from "@/hooks/use-po-modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
// import { stripeRedirect } from "@/actions/stripe-redirect";
// import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductModal } from "@/hooks/use-product-modal";
import { FormInput } from "../form/form-input";
import { FormSubmit } from "../form/form-submit";

export const NewProductModal = () => {
  const modal = useProductModal();

  // const { execute, isLoading } = useAction(createQuotation, {
  //   onSuccess: (data) => {
  //     window.location.href = data;
  //   },
  //   onError: (error) => {
  //     toast.error(error);
  //   }
  // });

  // const onClick = () => {
  //   execute({});
  // };

  // const execute = () => {
  //   window.location.href = "/";
  // };

  const onSubmit = (formData: FormData) => {
  }

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Product</DialogTitle>
          {/* <DialogDescription>Please select the vender.</DialogDescription> */}
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-2 gap-3">

          <div className="">
            <FormInput
              id="vender"
              label="Vender"
              type="text"
            // defaultValue={user?.name}
            // errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="name"
              label="Name"
              type="text"
            // defaultValue={user?.name}
            // errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="cost"
              label="Cost"
              type="text"
            // defaultValue={user?.name}
            // errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="percentage"
              label="Percentage"
              type="text"
            // defaultValue={user?.name}
            // errors={fieldErrors}
            />
          </div>
          <div className="col-start-2 col-span-1 flex justify-end">
            <FormSubmit>{false ? "Update Product" : "Create Product"}</FormSubmit>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
};

