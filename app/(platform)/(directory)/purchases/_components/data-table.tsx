'use client'
import React from 'react'
import { DataTable } from '@/components/ui/data-table'
import {
  ColumnDef,
} from "@tanstack/react-table"
// import TableFilter from '@/components/data-table/data-table.filters'


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export default function OrderTable<TData, TValue>(props: DataTableProps<TData, TValue>) {

  const { columns, data } = props

  return (
    <DataTable columns={columns} data={data} />
  )
}
