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

export const NewPurchaseModal = () => {
  const modal = usePurchaseModal();

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
    window.location.href = "/purchase-order/1";
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Purchase order</DialogTitle>
          {/* <DialogDescription>Please select the vender.</DialogDescription> */}
        </DialogHeader>
        <div className="pb-4 space-y-2">
          <div className="">
            <Label>Vender</Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="">
            <CustomerInfo />
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

const CustomerInfo = () => {
  return (
    <div className="rounded-2xl bg-gray-50 p-2">
      <dl className="mt-3 space-y-1 text-xs leading-6 text-gray-600">
        <div className="flex space-x-2">
          <dt>Tax Number:</dt>
          <dd className="font-semibold">3938827738493</dd>
        </div>
        <div className="flex space-x-2">
          <dt>Email:</dt>
          <dd className="font-semibold">hello@example.com</dd>
        </div>
        <div className="flex space-x-2">
          <dt>Phone number:</dt>
          <dd className="font-semibold">+1 (555) 905-5678</dd>
        </div>
        <div className="flex space-x-2">
          <dt>Fax:</dt>
          <dd className="font-semibold">
            <span className="block">+1 (555) 905-5679</span>
          </dd>
        </div>
        <div className="flex space-x-2">
          <dt>Address:</dt>
          <dd className="font-semibold">
            <span className="block">1234 North 1st Street</span>
            <span className="block">Springfield, IL 12345</span>
          </dd>
        </div>
      </dl>
    </div>
  );
};
