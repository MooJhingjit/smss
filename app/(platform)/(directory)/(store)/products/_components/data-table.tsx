"use client";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useProductModal } from "@/hooks/use-product-modal";
import { ProductWithRelations } from "@/types";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
// import TableFilter from '@/components/data-table/data-table.filters'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function ProductTable<TData, TValue>(
  props: DataTableProps<TData, TValue>,
) {
  const modal = useProductModal();

  const { columns, data } = props;

  const handleCreate = () => {
    modal.onOpen();
  };

  const onManage = (product: ProductWithRelations) => {
    modal.onOpen(product);
  };

  // modify actions column
  const modifiedColumns = columns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: any) => {
          return (
            <div className="flex space-x-2 items-center">
              <Button
                onClick={() => onManage(row.original)}
                className="text-xs h-8"
                variant="secondary"
              >
                จัดการ
              </Button>
              <Link href={`/products/${row.original.id}`} passHref>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
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
