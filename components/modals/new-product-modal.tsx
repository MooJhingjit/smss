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

  const execute = () => {
    window.location.href = "/";
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Product</DialogTitle>
          {/* <DialogDescription>Please select the vender.</DialogDescription> */}
        </DialogHeader>
        <div className="pb-4 space-y-2">
          <div className="">
            <Label>Vender</Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="">
            <Label>Name</Label>
            <Input id="name" value="" className="col-span-3" />
          </div>
          <div className="flex space-x-4">
            <div className="">
              <Label>Cost</Label>
              <Input id="name" value="" className="col-span-3" />
            </div>
            <div className="">
              <Label>Percentage</Label>
              <Input id="name" value="" className="col-span-3" />
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button type="button" onClick={execute}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

