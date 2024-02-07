"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchasePreviewModal } from "@/hooks/use-po-preview-modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/components/providers/query-provider";
import PURCHASE_ORDER_SERVICES from "@/app/services/service.purchase-order";
import { toast } from "sonner";
import TableLists from "@/components/table-lists";
import { PurchaseOrderPreview } from "@/types";


const columns = [
  {
    name: "Vendor", key: "Vendor",
    render: (item: PurchaseOrderPreview) => {
      return item.vendor?.name;
    },
  },
  { name: "Quantity", key: "quantity" },
  { name: "Total Price", key: "totalPrice" },
];


export const PurchasePreviewModal = () => {
  const modal = usePurchasePreviewModal();
  const { data, isOpen, onClose, queryKey, quotationId } = modal;

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

  const mutation = useMutation(
    {
      mutationFn: async () => {
        return await PURCHASE_ORDER_SERVICES.generatePOs({
          quotationId
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey })
        toast.success("Purchase order generated successfully");
        onClose();
      },
    }
  );

  const execute = () => {
    if (mutation.isPending) return;
    
    mutation.mutate();
  };

  if (!data) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Order Preview</DialogTitle>
        </DialogHeader>
        <div className="pb-4 space-y-2">

          <TableLists<PurchaseOrderPreview>
            columns={columns}
            data={data}
          />
        </div>
        <DialogFooter>
          <Button type="button" onClick={execute}>
            Confirm to Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


