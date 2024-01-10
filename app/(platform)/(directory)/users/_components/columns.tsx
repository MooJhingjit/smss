"use client"

import { Button } from "@/components/ui/button"
import { User } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// export type User = {
//   id: number
//   name: string
//   phone: string
//   email: string
//   address: string
//   type: "admin" | "user" | "vender"
// }

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "#",
    enableColumnFilter: true,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const { role } = row.original
      return (
        <p className="capitalize">{role}</p>
      )

    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id } = row.original
      return (
        <Button className="text-xs h-8" variant="secondary"> Manage</Button>
      )

    }
  },
]
