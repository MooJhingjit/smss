"use client";

import {
  paymentTypeMapping,
  quotationStatusMapping,
  quotationTypeMapping,
} from "@/app/config";
import { classNames, getDateFormat } from "@/lib/utils";
import { Contact, Quotation } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Coins, CreditCard } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<Quotation & { contact?: Contact }>[] = [
  {
    accessorKey: "code",
    header: "รหัส",
    cell: ({ row }) => {
      const { code } = row.original;
      return (
        <Link href={`/quotations/${row.original.id}`} className="">
          <p className="text-sm font-semibold underline">{code}</p>

          <div className="flex space-x-2 items-center mt-2">
            <span
              className={classNames(
                row.original.type === "service"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800",
                "inline-flex items-center rounded-md  px-1 py-1 text-xs font-medium ing-1 ring-inset ring-red-600/10",
              )}
            >
              {quotationTypeMapping[row.original.type]}
            </span>
            <span className="inline-flex items-center rounded-md  px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              {row.original.paymentType === "credit" ? (
                <CreditCard className="w-4 h-4 mr-1" />
              ) : (
                <Coins className="w-4 h-4 mr-1" />
              )}
              {paymentTypeMapping[row.original.paymentType]}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    cell: ({ row }) => {
      const { status } = row.original;
      return <p>{quotationStatusMapping[status].label}</p>;
    },
  },
  {
    accessorKey: "contact.name",
    header: "ลูกค้า",
    cell: ({ row }) => {
      const { contact } = row.original;
      return (
        <div>
          <h3 className="text-sm font-semibold">{contact?.name}</h3>
          <div className="flex space-x-2">
            <p className="text-xs text-gray-500">{contact?.email}</p>
            <p className="text-xs text-gray-500">{contact?.phone}</p>
          </div>
          <div className="flex space-x-2">
            <p className="text-xs text-gray-500">{contact?.address}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalPrice",
    header: "ราคารวม",
    cell: ({ row }) => {
      const { totalPrice } = row.original;
      return (
        <p>
          {totalPrice?.toLocaleString("th-TH", {
            style: "currency",
            currency: "THB",
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "discount",
    header: "ส่วนลด",
    cell: ({ row }) => {
      const { discount } = row.original;
      return (
        <p>
          {discount?.toLocaleString("th-TH", {
            style: "currency",
            currency: "THB",
          })}
        </p>
      );
    },
  },

  {
    accessorKey: "updatedAt",
    header: "แก้ไขล่าสุด",
    cell: ({ row }) => {
      const { updatedAt } = row.original;
      return <p>{getDateFormat(updatedAt)}</p>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "วันที่สร้าง",
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return <p>{getDateFormat(createdAt)}</p>;
    },
  },
];
