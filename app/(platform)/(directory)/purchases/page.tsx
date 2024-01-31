import Breadcrumbs from "@/components/breadcrumbs";
import { Order, columns } from "./_components/columns";
import OrderTable from "./_components/data-table";
import { db } from "@/lib/db";

const getData = async (id: string) => {
  const data = await db.purchaseOrder.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      vendor: true,
      quotation: true,
      purchaseOrderItems: true
    }
  });
  return data;
};

interface Props {
  params: {
    purchaseOrderId: string;
  };
}

export default async function PurchaseOrders(
  props: Readonly<Props>,
) {
  const { params } = props;
  const data = await getData(params.purchaseOrderId);
  const pages = [
    {
      name: "Purchase Orders",
      href: "/purchases",
      current: false,
    },
    {
      name: data?.code ?? "",
      href: "",
      current: true,
    },
  ];

  return (
    <>
      <Breadcrumbs pages={pages} />
      {/* <OrderTable columns={columns} data={data} /> */}
    </>
  );
}
