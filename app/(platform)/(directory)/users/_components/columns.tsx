"use client";

import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// export type User = {
//   id: number
//   name: string
//   phone: string
//   email: string
//   address: string
//   type: "admin" | "user" | "vendor"
// }

export const columns: ColumnDef<User>[] = [
  {
    id: "actions",
  },
  {
    accessorKey: "id",
    header: "#",
    enableColumnFilter: true,
  },
  {
    accessorKey: "name",
    header: "ชื่อ",
  },
  {
    accessorKey: "phone",
    header: "เบอร์โทร",
  },
  {
    accessorKey: "email",
    header: "อีเมล์",
  },
  {
    accessorKey: "address",
    header: "ที่อยู่",
  },
  {
    accessorKey: "type",
    header: "ประเภท",
    cell: ({ row }) => {
      const { role } = row.original;
      return <p className="capitalize">{role}</p>;
    },
  },
  
];
