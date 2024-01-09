"use client";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useUserModal } from "@/hooks/use-user-modal";
// import TableFilter from '@/components/data-table/data-table.filters'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function UserTable<TData, TValue>(
  props: DataTableProps<TData, TValue>
) {
  const { columns, data } = props;

  const modal = useUserModal()

  const handleCreate = () => {
    modal.onOpen()
  };

  return <DataTable columns={columns} data={data} onCreate={handleCreate} />;
}
