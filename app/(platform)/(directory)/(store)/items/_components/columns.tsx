"use client";

import { Item } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "serialNumber",
    header: "Serial Number",
  },
  {
    accessorKey: "name",
    header: "ชื่อสินค้า",
  },
  {
    accessorKey: "cost",
    header: "ราคาซื้อ",
    cell: ({ row }) => {
      const { cost } = row.original;

      if (cost === null) {
        return 0;
      }

      return cost?.toLocaleString("th-TH", {
        style: "currency",
        currency: "THB",
      }) ?? 0
    }
  },

  {
    id: "warrantyDate",
    accessorKey: "warrantyDate",
    header: "วันหมดประกัน",
  },
  {
    id: "po",
    accessorKey: "purchaseOrderItem.purchaseOrder.code",
    header: "ใบสั่งซื้อ (PO)",
  },
];
