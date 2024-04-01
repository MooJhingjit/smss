"use client";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { getDateFormat } from "@/lib/utils";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function ItemTable<TData, TValue>(
  props: DataTableProps<TData, TValue>,
) {
  const { columns, data } = props;

  const modifiedColumns = columns.map((column) => {
    if (column.id === "warrantyDate") {
      return {
        ...column,
        cell: ({ row }: any) => {
          return (
            <div className="flex space-x-2 items-center">
              {row.original.warrantyDate &&
                getDateFormat(new Date(row.original.warrantyDate))}
            </div>
          );
        },
      };
    } else if (column.id === "po") {
      return {
        ...column,
        cell: ({ row }: any) => {
          return (
            <Link
              target="_blank"
              href={`/purchase-orders/${row.original.purchaseOrderItem.purchaseOrder.id}`}
              className="text-blue-500 hover:underline flex space-x-2 items-center"
            >
              <span>{row.original.purchaseOrderItem.purchaseOrder.code}</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </Link>
          );
        },
      };
    }
    return column;
  });

  return <DataTable columns={modifiedColumns} data={data} />;
}
