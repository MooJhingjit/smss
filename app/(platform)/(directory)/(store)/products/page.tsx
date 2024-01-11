import Breadcrumbs from "@/components/breadcrumbs"
import { Product, columns } from "./_components/columns"
import ProductTable from "./_components/data-table"
import { db } from "@/lib/db";

const pages = [
  {
    name: "All Products",
    href: "/products",
    current: true,
  },
];

async function getData(): Promise<any[]> {
  // findMany returns an array of 10 users
  const items = await db.product.findMany({
    // take: 10,
    // skip: 0,
    orderBy: {
      id: "asc",
    },
  });
  return items;
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
