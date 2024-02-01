"use client";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
// import TableFilter from '@/components/data-table/data-table.filters'
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function PurchaseOrderTable<TData, TValue>(
  props: DataTableProps<TData, TValue>
) {
  const { columns, data } = props;

  // modify actions column
  const modifiedColumns = columns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: any) => {
          return (
            <div className="flex space-x-2 items-center">
              <Link href={`/purchases/${row.original.id}`} passHref>
                <Button
                  className="text-xs h-8"
                  variant="secondary"
                >
                  Manage
                </Button>
              </Link>
            </div>
          );
        },
      };
    }
    return column;
  });

  return <DataTable columns={modifiedColumns} data={data} />;
}
