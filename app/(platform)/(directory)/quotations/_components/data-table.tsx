"use client";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Contact } from "@prisma/client";
import Link from "next/link";
// import TableFilter from '@/components/data-table/data-table.filters'
import { useQuotationModal } from "@/hooks/use-quotation-modal";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function ContactTable<TData, TValue>(
  props: DataTableProps<TData, TValue>,
) {
  const { columns, data } = props;

  const { onOpen } = useQuotationModal();

  // modify actions column
  const modifiedColumns = columns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: any) => {
          return (
            <Link
              href={`/quotations/${(row.original as Contact).id}`}
              className="text-xs h-8"
            >
              จัดการ
            </Link>
          );
        },
      };
    }
    return column;
  });

  return <DataTable columns={modifiedColumns} data={data} onCreate={onOpen} />;
}
