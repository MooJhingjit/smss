"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useItemModal } from "@/hooks/use-item-modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ItemModal = () => {
  const modal = useItemModal();
  const data = modal.data
  console.log("data", data)

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
    window.location.href = "/quotations/1";
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Items</DialogTitle>
          <DialogDescription>
            <div className="flex space-x-3">
              <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-blue-700/10">
                PO-0001
              </span>
              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-blue-700/10">
                Wireless Mouse
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button type="button" onClick={execute}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

