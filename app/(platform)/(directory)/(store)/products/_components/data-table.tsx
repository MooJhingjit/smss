'use client'
import React from 'react'
import { DataTable } from '@/components/ui/data-table'
import {
  ColumnDef,
} from "@tanstack/react-table"
import { useProductModal } from '@/hooks/use-product-modal'
// import TableFilter from '@/components/data-table/data-table.filters'


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export default function ProductTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const modal = useProductModal();

  const { columns, data } = props

  const handleCreate = () => {
    modal.onOpen()
  }

  return (
    <DataTable columns={columns} data={data} onCreate={handleCreate} />
  )
}
