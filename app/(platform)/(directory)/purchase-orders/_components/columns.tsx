"use client";

import { getDateFormat } from "@/lib/utils";
import { PurchaseOrderWithRelations } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Order = {
  id: number;
  quotation_id: string;
  vendor: string;
  itemCount: number;
  cost: string;
};

export const columns: ColumnDef<PurchaseOrderWithRelations & {
  _count: {
    purchaseOrderItems: number;
  };
}>[] = [
    {
      accessorKey: "id",
      header: "#",
    },
    {
      accessorKey: "code",
      header: "รหัส",
    },
    {
      accessorKey: "vendor.name",
      header: "ผู้ขาย/ร้านค้า",
      cell: ({ row }) => {
        const { vendor } = row.original;
        return vendor?.name;
      }
    },

    {
      accessorKey: "totalDiscount",
      header: "ส่วนลด",
    },
    {
      accessorKey: "totalTax",
      header: "ภาษี",
    },
    {
      accessorKey: "createdAt",
      header: "สร้างเมื่อ",
      cell: ({ row }) => {
        const { createdAt } = row.original
        return getDateFormat(createdAt);
      }
    },
    {
      id: "actions",
    },
  ];
