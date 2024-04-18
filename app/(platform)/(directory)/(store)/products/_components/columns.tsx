"use client";

import { productTypeMapping } from "@/app/config";
import { Button } from "@/components/ui/button";
import { ProductType } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
  id: number;
  name: string;
  vendor: string;
  type: ProductType;
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
    accessorKey: "type",
    header: "ประเภท",
    cell: ({ row }) => {
      const { type } = row.original;
      return productTypeMapping[type];
    },
  },
  {
    accessorKey: "vendor.name",
    header: "ผู้ขาย/ร้านค้า",
  },
  {
    accessorKey: "cost",
    header: "ต้นทุน",
    cell: ({ row }) => {
      const { cost } = row.original;
      
      return parseInt(cost)?.toLocaleString("th-TH", {
        style: "currency",
        currency: "THB",
      }) ?? 0
    }
  },
  {
    accessorKey: "unit",
    header: "หน่วย",
  },
  {
    accessorKey: "percentage",
    header: "กำไร(%)",
  },
  {
    id: "actions",
  },
];
