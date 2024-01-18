'use client';
import TableLists from '@/components/table-lists';
import React from 'react'
import { useItemModal } from "@/hooks/use-item-modal";
import { Item } from '@prisma/client';

const columns = [
  { name: 'Purchase ID', key: 'poID' },
  { name: 'Name', key: 'name' },
  { name: 'Serial Number', key: 'serialNumber' },
  {
    name: 'Warranty', key: 'warrantyDate',
    render: (item: Item) => {
      if (!item.warrantyDate) return null;

      const date = new Date(item.warrantyDate);
      return date.toLocaleDateString('th-TH',);
    }
  },
  { name: 'Cost', key: 'cost' },
  { name: 'Status', key: 'status' },
];

type Props = {
  data: Item[]
};
export default function ProductItems(props: Props) {
  const { data } = props;
  const modal = useItemModal();

  return (
    <TableLists<Item>
      columns={columns}
      data={data}
      onManage={(item) => modal.onOpen(item)}
    />
  )
}
