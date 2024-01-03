import Breadcrumbs from '@/components/breadcrumbs';
import TableView from '@/components/data-table/data-table.index';
import React from 'react'
const pages = [
  {
    name: "All Products",
    href: "/products",
    current: true,
  },
];
export default function ProductPage() {
  return (
    <div>
      <Breadcrumbs pages={pages} />
      <TableView />
    </div>
  )
}
