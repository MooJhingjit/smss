"use client";

import { Button } from "@/components/ui/button";
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

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "#",
  },
  {
    accessorKey: "quotation_id",
    header: "QT",
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
  },
  {
    accessorKey: "itemCount",
    header: "Balance",
  },
  {
    accessorKey: "cost",
    header: "total",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <Button className="text-xs h-8" variant="secondary">
          {" "}
          Manage
        </Button>
      );
    },
  },
];
