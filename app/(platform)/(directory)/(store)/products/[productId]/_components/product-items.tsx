'use client';
import TableLists from '@/components/table-lists';
import React from 'react'
import { DataType } from '../page';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useItemModal } from "@/hooks/use-item-modal";

const columns = [
  { name: 'Purchase ID', key: 'poID' },
  { name: 'Name', key: 'name' },
  { name: 'Serial Number', key: 'serialNumber' },
  { name: 'Warranty', key: 'warrantyExpires' },
  { name: 'Cost', key: 'cost' },
  { name: 'Status', key: 'status' },
];


type Props = {
  data: DataType[]
};
export default function ProductItems(props: Props) {
  const { data } = props;
  const modal = useItemModal();

  return (
    <TableLists<DataType>
      columns={columns}
      data={data}
      onManage={(item) => modal.onOpen(item)}
    />
  )
}
