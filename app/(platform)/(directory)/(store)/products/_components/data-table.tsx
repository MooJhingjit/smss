'use client'
import React from 'react'
import { DataTable } from '@/components/ui/data-table'
import {
  ColumnDef,
} from "@tanstack/react-table"
import { useProductModal } from '@/hooks/use-product-modal'
import { Product } from '@prisma/client'
import { Button } from '@/components/ui/button'
// import TableFilter from '@/components/data-table/data-table.filters'


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export default function ProductTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const modal = useProductModal();

  const { columns, data } = props

  const handleCreate = () => {
    modal.onOpen();
  };

  const onManage = (product: Product) => {
    modal.onOpen(product);
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
  )
}
