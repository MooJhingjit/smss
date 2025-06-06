"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { usePurchasePreviewModal } from "@/hooks/use-po-preview-modal";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/components/providers/query-provider";
import PURCHASE_ORDER_SERVICES from "@/app/services/api.purchase-order";
import { toast } from "sonner";
import TableLists from "@/components/table-lists";
import { PurchaseOrderPreview } from "@/types";
import { LockIcon } from "lucide-react";

const columns = [
  {
    name: "PO",
    key: "index",
  },
  {
    name: "ผู้ขาย/ร้านค้า",
    key: "Vendor",
    render: (item: PurchaseOrderPreview) => {
      return item.vendor?.name;
    },
  },
  { name: "จำนวนสินค้า", key: "quantity" },
  { name: "ราคาทั้งหมด", key: "totalCost" },
];

export const PurchasePreviewModal = () => {
  const modal = usePurchasePreviewModal();
  const { data, isOpen, onClose, queryKey, quotationId } = modal;

  const mutation = useMutation({
    mutationFn: async () => {
      return await PURCHASE_ORDER_SERVICES.generatePOs({
        quotationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("สร้างใบสั่งซื้อ(PO) สำเร็จ");
      onClose();
    },
  });

  const execute = () => {
    if (mutation.isPending) return;

    mutation.mutate();
  };

  if (!data) {
    return null;
  }

  return (
    <ResponsiveDialog 
      open={isOpen} 
      onOpenChange={onClose}
      title="สร้างใบสั่งซื้อ(PO)"
      description=""
    >
      <div className="flex space-x-3 items-center mb-4">
        <LockIcon className="w-10 h-10 text-yellow-500" />
        <p className="text-xs text-yellow-500">
          หลังจากการสร้างใบสั่งซื้อ(PO) ใบเสนอราคา(QT)จะไม่สามารถแก้ไขได้
          โปรดตรวจสอบความถูกต้องในใบเสนอราคา(QT) ก่อนทำรายการ
        </p>
      </div>
      
      <div className="pb-4 space-y-2">
        <TableLists<PurchaseOrderPreview> columns={columns} data={data} />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="destructive" onClick={execute}>
          ยืนยันการทำรายการ
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
