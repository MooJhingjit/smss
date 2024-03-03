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
      accessorKey: "code",
      header: "ใบสั่งซื้อ",
    },
    {
      accessorKey: "quotation.code",
      header: "ใบเสนอราคา",
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
      accessorKey: "discount",
      header: "ส่วนลด",
    },
    {
      accessorKey: "tax",
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
