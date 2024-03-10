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
