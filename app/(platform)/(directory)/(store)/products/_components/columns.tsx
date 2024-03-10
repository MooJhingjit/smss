"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
  id: number;
  name: string;
  vendor: string;
  itemCount: number;
  cost: string;
  percentage: string;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "#",
  },
  {
    accessorKey: "name",
    header: "ชื่อสินค้า",
  },
  {
    accessorKey: "vendor.name",
    header: "ผู้ขาย/ร้านค้า",
  },
  {
    accessorKey: "cost",
    header: "ต้นทุน",
  },
  {
    accessorKey: "percentage",
    header: "กำไร(%)",
  },
  {
    id: "actions",
  },
];



