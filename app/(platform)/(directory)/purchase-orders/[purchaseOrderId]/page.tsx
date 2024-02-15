import React from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import VendorInfo from "./_components/vendor-details";
import OrderStatus from "./_components/order-status";
import OrderItems from "./_components/order-items";
import AssociateOrders from "./_components/associate-orders";
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

const getAssociateOrders = async (quotationId: number, excluded: number) => {
  const data = await db.purchaseOrder.findMany({
    where: {
      quotationId,
      id: {
        not: excluded
      }
    }
  });
  return data;
}

export default async function PurchaseOrderDetails(
  props: Readonly<Props>,
) {
  const { params } = props;
  const data = await getData(params.purchaseOrderId);

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-sm">Data not found</p>
      </div>
    );
  }

  const associateOrders = await getAssociateOrders(data.quotationId, data.id);
  const pages = [
    {
      name: "Purchase Orders",
      href: "/purchase-orders",
      current: false,
    },
    {
      name: data?.code ?? "",
      href: "",
      current: true,
    },
  ];

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-sm">Data not found</p>
      </div>
    );
  }

  const { quotation, vendor } = data;

  return (
    <>
      <Breadcrumbs pages={pages} />
      <div className="grid grid-cols-5 gap-8 mt-6">
        <div className="col-span-3">
          {
            vendor && (
              <VendorInfo data={vendor} />
            )
          }
        </div>
        <div className="col-span-2">
          <OrderStatus
            quotation={quotation}
            status={data.status} />
        </div>
        <div className="col-span-5">
          <OrderItems data={data} />
        </div>
        {
          associateOrders.length > 0 && (
            <div className="col-span-5">
              <AssociateOrders quotationCode={data.quotation.code} data={associateOrders} />
            </div>
          )
        }
      </div>
    </>
  );
}
