"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { usePurchaseOrderReceiptModal } from "@/hooks/use-po-receipt-modal";
import { useState } from "react";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createPurchaseOrderReceipt } from "@/actions/po/createReceipt";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import ConfirmActionButton from "../confirm-action";
import { Button } from "../ui/button";
import { Info } from "lucide-react";

export const PurchaseOrderReceiptModal = () => {
  const modal = usePurchaseOrderReceiptModal();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data } = modal;
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
    <ResponsiveDialog
      open={modal.isOpen}
      onOpenChange={modal.onClose}
      title="เลือกรายการที่ต้องการออกใบเสร็จ"
      description="เลือกรายการสินค้าที่ต้องการออกใบเสร็จ"
    >
      <div className="space-y-4">
        <ToggleGroup
          type="multiple"
          className="grid grid-cols-1 gap-2"
          onValueChange={(selected) => {
            setSelectedItems(selected);
          }}
        >
          {data?.purchaseOrderItems?.map((item) => (
            <ToggleGroupItem
              key={item.id}
              value={item.id.toString()}
              className="w-full flex justify-between items-center p-4"
              disabled={!!item.receiptId}
            >
              <p className="w-full text-center mx-auto">{item.name}</p>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex items-center justify-center border-t pt-4 space-x-3">
          <div className="flex space-x-2">
            <Info size={20} className="text-yellow-700" />
            <p className="text-sm text-yellow-700">
              หลังจากออกใบเสร็จแล้วจะไม่สามารถแก้ไขได้
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
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
      </DialogFooter>
    </ResponsiveDialog>
  );
};
