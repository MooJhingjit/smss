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
      header: "Code",
    },
    {
      accessorKey: "vendor.name",
      header: "Vendor",
      cell: ({ row }) => {
        const { vendor } = row.original;
        return vendor?.name;
      }
    },
    {
      accessorKey: "itemCount",
      header: "Item Count",
      cell: ({ row }) => {
        const { _count } = row.original;
        return _count.purchaseOrderItems;
      }
    },

    {
      accessorKey: "totalDiscount",
      header: "Total Discount",
    },
    {
      accessorKey: "totalTax",
      header: "Total Tax",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const { createdAt } = row.original
        return getDateFormat(createdAt);
      }
    },
    {
      id: "actions",
    },
  ];
