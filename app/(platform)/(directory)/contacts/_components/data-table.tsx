"use client";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useContactModal } from "@/hooks/use-contact-modal";
import { Button } from "@/components/ui/button";
import { Contact } from "@prisma/client";
// import TableFilter from '@/components/data-table/data-table.filters'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function ContactTable<TData, TValue>(
  props: DataTableProps<TData, TValue>,
) {
  const { columns, data } = props;

  const modal = useContactModal();

  const handleCreate = () => {
    modal.onOpen();
  };

  const onManage = (contact: Contact) => {
    modal.onOpen(contact);
  };

  // modify actions column
  const modifiedColumns = columns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: any) => {
          return (
            <Button
              onClick={() => onManage(row.original)}
              className="text-xs h-8"
              variant="secondary"
            >
              จัดการ
            </Button>
          );
        },
      };
    }
    return column;
  });

  return (
    <DataTable columns={modifiedColumns} data={data} onCreate={handleCreate} />
  );
}
