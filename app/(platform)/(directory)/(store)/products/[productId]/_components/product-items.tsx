'use client';
import TableLists from '@/components/table-lists';
import React from 'react'
import { useItemModal } from "@/hooks/use-item-modal";
import { Item } from '@prisma/client';
import { ProductWithRelations } from '@/types';
import Toolbar from './toolsbar';

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
  data: ProductWithRelations
};
export default function ProductItems(props: Props) {
  const { data } = props;
  const [filteredData, setFilteredData] = React.useState<Item[]>(data?.items ?? []);
  const modal = useItemModal();

  const handleFilter = (value: string) => {
    if (!value) {
      setFilteredData(data?.items ?? []);
      return;
    }

    const filtered = data?.items?.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
    setFilteredData(filtered ?? []);
  }

  return (
    <>
      <div className="flex justify-end">
        <Toolbar data={data} onFilter={handleFilter} />
      </div>
      <div className="overflow-x-scroll mt-3">
        <TableLists<Item>
          columns={columns}
          data={filteredData}
          onManage={(item) => modal.onOpen(item, {
            productRef: { id: data.id, name: data.name },
            vendorRef: { id: data.vendor?.id, name: data.vendor?.name },
          })}
        />
      </div>

    </>

  )
}
