import Breadcrumbs from "@/components/breadcrumbs";
import { columns } from "./_components/columns";
import ItemTable from "./_components/data-table";
import { db } from "@/lib/db";
import { Item } from "@prisma/client";

const pages = [
  {
    name: "สินค้าในคลังทั้งหมด",
    href: "/items",
    current: true,
  },
];

async function getData(): Promise<Item[]> {
  // findMany returns an array of 10 users
  const items = await db.item.findMany({
    include: {
      purchaseOrderItem: {
        include: {
          purchaseOrder: true,
        },
      }
    },
    // take: 10,
    // skip: 0,
    orderBy: {
      id: "desc",
    },
  });

  return items;
}

export default async function ItemPage() {
  const data = await getData();

  return (
    <>
      <Breadcrumbs pages={pages} />
      <ItemTable columns={columns} data={data} />
    </>
  );
}
