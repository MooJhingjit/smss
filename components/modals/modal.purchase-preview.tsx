"use client";

import { useState } from "react";
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
import { LockIcon, CalendarIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
  const [customDate, setCustomDate] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async () => {
      return await PURCHASE_ORDER_SERVICES.generatePOs({
        quotationId,
        // Only send customDate if user provided one
        ...(customDate && { customDate }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("สร้างใบสั่งซื้อ(PO) สำเร็จ");
      onClose();
      window.location.reload();
    },
    // failed, wait 2 seconds and reload
    onError: (error: any) => {
      setTimeout(() => {
        // reload the page after 2 seconds 
        window.location.reload();
      }, 1000);
    }
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
      classNames="lg:max-w-4xl"
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

      {/* Optional custom date for regenerating POs after rollback */}
      <div className="pb-4 space-y-2">
        <Label htmlFor="customDate" className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          วันที่สร้าง PO (ไม่บังคับ)
        </Label>
        <Input
          id="customDate"
          type="datetime-local"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          placeholder="เลือกวันที่ (สำหรับสร้างใหม่หลัง Rollback)"
          className="max-w-xs"
        />
        <p className="text-xs text-muted-foreground">
          ใช้สำหรับสร้าง PO ใหม่หลังจาก Rollback โดยใช้วันที่เดิม หากไม่ระบุจะใช้วันที่ปัจจุบัน
        </p>
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="destructive" 
          onClick={execute}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "กำลังสร้าง..." : "ยืนยันการทำรายการ"}
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
