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

export const columns: ColumnDef<
  PurchaseOrderWithRelations & {
    _count: {
      purchaseOrderItems: number;
    };
  }
>[] = [
   {
      id: "actions",
    },
    {
      accessorKey: "code",
      header: "ใบสั่งซื้อ",
    },
    {
      accessorKey: "quotation.code",
      header: "ใบเสนอราคา",
      cell: ({ row }) => {
        const { quotation } = row.original;
        return quotation?.code ?? "--Manual--"; 
      },
    },
    {
      accessorKey: "vendor.name",
      header: "ผู้ขาย/ร้านค้า",
      cell: ({ row }) => {
        const { vendor } = row.original;
        return vendor?.name;
      },
    },
    {
      accessorKey: "discount",
      header: "ส่วนลด",
      cell: ({ row }) => {
        const { discount } = row.original;
        return discount?.toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",
        }) ?? 0;
      },
    },
    {
      accessorKey: "cost",
      header: "ราคารวม",
      cell: ({ row }) => {
        const { totalPrice } = row.original;
        return totalPrice?.toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",
        }) ?? 0
      }
    },
    {
      accessorKey: "cost",
      header: "ยอดสุทธิ (รวม VAT)",
      cell: ({ row }) => {
        const grandTotal = row.original.grandTotal?.toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",
        }) ?? 0

        const vat = row.original?.vat?.toLocaleString("th-TH") ?? 0

        return grandTotal + "( +vat " + vat + " )"
      }
    },
    {
      accessorKey: "createdAt",
      header: "สร้างเมื่อ",
      cell: ({ row }) => {
        const { createdAt } = row.original;
        return getDateFormat(createdAt);
      },
    },
   
  ];
