import Breadcrumbs from "@/components/breadcrumbs"
import { Order, columns } from "./_components/columns"
import OrderTable from "./_components/data-table"

const pages = [
  {
    name: "All Orders",
    href: "/purchases",
    current: true,
  },
];

async function getData(): Promise<Order[]> {
  // Fetch data from your API here.
  return [
    { id: 1, quotation_id: 'QT-0001', vendor: 'Banana IT', itemCount: 4, cost: '3500'},
    { id: 2, quotation_id: 'QT-0002', vendor: 'TechGear', itemCount: 3, cost: '800' },
  ]
}

export default async function OrderPage() {
  const data = await getData()

  return (
    <>
      <Breadcrumbs pages={pages} />
      <OrderTable columns={columns} data={data} />
    </>
  )
}
