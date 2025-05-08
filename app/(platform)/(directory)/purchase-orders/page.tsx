import Breadcrumbs from "@/components/breadcrumbs";
import { Order, columns } from "./_components/columns";
import PurchaseOrderTable from "./_components/data-table";
import { db } from "@/lib/db";

async function getData(): Promise<any[]> {
  // findMany returns an array of 10 users
  const items = await db.purchaseOrder.findMany({
    include: {
      _count: {
        select: { purchaseOrderItems: true },
      },
      vendor: {
        select: {
          id: true,
          name: true,
        },
      },
      quotation: {
        select: {
          code: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return items;
}

interface Props {
  params: {
    purchaseOrderId: string;
  };
}

export default async function PurchaseOrders(props: Readonly<Props>) {
  const data = await getData();
  const pages = [
    {
      name: "การสั่งซื้อทั้งหมด (Purchase Orders)",
      href: "/purchase-orders",
      current: false,
    },
  ];

  return (
    <>
      <Breadcrumbs pages={pages} />
      <PurchaseOrderTable columns={columns} data={data} />
    </>
  );
}
