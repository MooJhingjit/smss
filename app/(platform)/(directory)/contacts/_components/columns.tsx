"use client";

import { Button } from "@/components/ui/button";
import { User, Contact } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck } from "lucide-react";

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

export const columns: ColumnDef<User & { user?: User }>[] = [
  {
    id: "actions",
    // cell: ({ row }) => {
    //   const { id } = row.original
    //   return (
    //     <Button className="text-xs h-8" variant="secondary"> Manage</Button>
    //   )

    // }
  },
  {
    accessorKey: "id",
    header: "#",
    enableColumnFilter: true,
  },
  {
    accessorKey: "taxId",
    header: "Tax ID",
  },
  {
    accessorKey: "name",
    header: "ชื่อ",
    cell: ({ row }) => {
      const { name } = row.original;
      return (
        <div className="flex items-center space-x-2">
          <p>{name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "เบอร์โทร",
  },
  {
    accessorKey: "email",
    header: "อีเมล์",
  },
  // {
  //   accessorKey: "address",
  //   header: "ที่อยู่",
  // },
  {
    accessorKey: "userId",
    header: "ผู้ดูแล",
    cell: ({ row }) => {
      const seller = row.original.user;
      return (
        <div className="">
          {seller && (
            <div className="text-sm">
              <p>{seller.name} ({seller.role})</p>
              {/* <p>{seller.email}</p> */}
            </div>
          )}
        </div>
      );
    },
  },

];
export const sellerColumns: ColumnDef<User & { user?: Contact }>[] = [

  {
    id: "actions",
    // cell: ({ row }) => {
    //   const { id } = row.original
    //   return (
    //     <Button className="text-xs h-8" variant="secondary"> Manage</Button>
    //   )

    // }
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

];
