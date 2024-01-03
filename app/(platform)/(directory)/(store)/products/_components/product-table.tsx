'use client'
import TableView from '@/components/data-table/data-table.index'
import React from 'react'
import { useProductModal } from '@/hooks/use-product-modal'
interface Props {
  data: any[];
}

export default function ProductTable(props: Props) {
  const modal = useProductModal();
  const { data: products } = props;
  const handleCreate = () => {
    modal.onOpen();
  }
  return (
    <TableView
      data={products}
      onCreate={handleCreate}
    />
  )
}
