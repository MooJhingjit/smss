import Breadcrumbs from "@/components/breadcrumbs"
import { Product, columns } from "./columns"
import ProductTable from "./data-table"

const pages = [
  {
    name: "All Products",
    href: "/products",
    current: true,
  },
];

async function getData(): Promise<Product[]> {
  // Fetch data from your API here.
  return [
    { id: 1, name: 'CCTV 2.7-13.5mm IP Camera', vender: 'Banana IT', itemCount: 4, cost: '3500', percentage: '15' },
    { id: 2, name: 'Wireless Mouse', vender: 'TechGear', itemCount: 3, cost: '800', percentage: '10' },
    { id: 3, name: 'Portable Hard Drive 1TB', vender: 'StoragePlus', itemCount: 4, cost: '4500', percentage: '20' },
    { id: 4, name: '27-inch LED Monitor', vender: 'VisualTech', itemCount: 1, cost: '12000', percentage: '5' },
    { id: 5, name: 'USB 3.0 Flash Drive 128GB', vender: 'MemoryWorld', itemCount: 1, cost: '1500', percentage: '12' },
    { id: 6, name: 'Ergonomic Keyboard', vender: 'InputEase', itemCount: 10, cost: '2000', percentage: '8' },
    { id: 7, name: 'Graphic Tablet', vender: 'ArtisticTouch', itemCount: 21, cost: '6000', percentage: '25' },
    { id: 8, name: 'Wi-Fi Router AC1200', vender: 'NetStream', itemCount: 2, cost: '3200', percentage: '18' },
    { id: 9, name: 'Bluetooth Speakers', vender: 'SoundWave', itemCount: 6, cost: '2800', percentage: '30' },
    { id: 10, name: 'HD Webcam', vender: 'ClearVision', itemCount: 8, cost: '2200', percentage: '7' }
  ]
}

export default async function ProductPage() {
  const data = await getData()

  return (
    <>
      <Breadcrumbs pages={pages} />
      <ProductTable columns={columns} data={data} />
    </>
  )
}
