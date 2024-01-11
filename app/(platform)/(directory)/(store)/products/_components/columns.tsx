"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
  id: number
  name: string
  vender: string
  itemCount: number
  cost: string
  percentage: string
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "#",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "vender",
    header: "Vender",
  },
  {
    accessorKey: "itemCount",
    header: "Item Count",
  },
  {
    accessorKey: "cost",
    header: "Cost",
  },
  {
    accessorKey: "percentage",
    header: "Percentage",
  },
  {
    id: "actions"
  },
]
