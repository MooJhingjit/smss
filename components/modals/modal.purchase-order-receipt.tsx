"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchaseOrderReceiptModal } from "@/hooks/use-po-receipt-modal";
import { useState } from "react";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPurchaseOrderReceipt } from "@/actions/po/createReceipt";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import ConfirmActionButton from "../confirm-action";
import { Button } from "../ui/button";
import { Info } from "lucide-react";

export const PurchaseOrderReceiptModal = () => {
  const modal = usePurchaseOrderReceiptModal();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data, refs } = modal;
  const handleCreate = useAction(createPurchaseOrderReceipt, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = async () => {
    const payload = {
      purchaseOrderItemIds: selectedItems,
    };
    handleCreate.execute({ ...payload });
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เลือกรายการที่ต้องการออกใบเสร็จ</DialogTitle>
        </DialogHeader>
        <div>
          <ToggleGroup
            type="multiple"
            className="space-x-4 py-8"
            onValueChange={(selected) => {
              setSelectedItems(selected);
            }}
          >
            {refs?.purchaseOrderItems?.map((item) => (
              <ToggleGroupItem
                key={item.id}
                value={item.id.toString()}
                className="w-full flex justify-between items-center"
                disabled={!!item.receiptId}
              >
                <p className="w-full text-center mx-auto">{item.name}</p>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex items-center justify-center border-t  pt-4 space-x-3">
            <div className="flex space-x-2">
              <Info size={20} className=" text-yellow-700" />
              <p className="text-sm text-yellow-700">
                หลังจากออกใบเสร็จแล้วจะไม่สามารถแก้ไขได้
              </p>
            </div>
            <ConfirmActionButton
              disabled={selectedItems.length === 0}
              onConfirm={() => {
                onSubmit();
              }}
            >
              <Button variant={"default"} size={"sm"}>
                ออกใบเสร็จ {selectedItems.length} รายการ
              </Button>
            </ConfirmActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
