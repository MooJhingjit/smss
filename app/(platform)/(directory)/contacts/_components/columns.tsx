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
    accessorKey: "userId",
    header: "ผู้สร้าง",
    cell: ({ row }) => {
      return <p className="capitalize">???</p>;
    },
  },
  {
    id: "actions",
    // cell: ({ row }) => {
    //   const { id } = row.original
    //   return (
    //     <Button className="text-xs h-8" variant="secondary"> Manage</Button>
    //   )

    // }
  },
];
