"use client";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useUserModal } from "@/hooks/use-user-modal";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
// import TableFilter from '@/components/data-table/data-table.filters'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function UserTable<TData, TValue>(
  props: DataTableProps<TData, TValue>,
) {
  const { columns, data } = props;

  const modal = useUserModal();

  const handleCreate = () => {
    modal.onOpen();
  };

  const onManage = (user: User) => {
    modal.onOpen(user);
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
              Manage
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
