import React from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import VendorInfo from "./_components/vendor-details";
import PurchaseOrderItems from "./_components/order-items";
import AssociateOrders from "./_components/associate-orders";
import { db } from "@/lib/db";
import DocumentItems from "../../../../../components/document-lists";
import PurchaseOrderInfo from "./_components/order-info";
import { redirect } from 'next/navigation'

const getData = async (id: string) => {
  const data = await db.purchaseOrder.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      vendor: true,
      quotation: true,
      purchaseOrderItems: {
        include: {
          items: true,
        },
      },
    },
  });
  return data;
};

interface Props {
  params: {
    purchaseOrderId: string;
  };
}

const getAssociateOrders = async (
  quotationId: number | null,
  excluded: number,
) => {
  if (!quotationId) {
    return [];
  }

  const data = await db.purchaseOrder.findMany({
    where: {
      quotationId,
      id: {
        not: excluded,
      },
    },
  });
  return data;
};

export default async function PurchaseOrderDetails(props: Readonly<Props>) {
  const { params } = props;

  if (params.purchaseOrderId === 'undefined') {
    redirect('/purchase-orders')
  }

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
      name: "การสั่งซื้อทั้งหมด (Purchase Orders)",
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

  const { vendor } = data;

  return (
    <>
      <Breadcrumbs pages={pages} />
      <div className="grid grid-cols-6 gap-8 mt-6">
        <div className="col-span-6 md:col-span-3">
          {vendor && <VendorInfo data={vendor} />}
        </div>
        <div className="col-span-6 md:col-span-3">
          <PurchaseOrderInfo data={data} />
          {/* <PurchaseOrderTools
            orderId={data.id}
            quotationId={data.quotationId}
            quotationCode={data.quotation?.code ?? ""}
            quotationStatus={data.quotation?.status}
            status={data.status}
            paymentDue={
              data.paymentDue
                ? new Date(data.paymentDue).toISOString().split("T")[0]
                : ""
            }
            paymentType={data.paymentType}
          /> */}
        </div>
        <div className="col-span-6">
          <PurchaseOrderItems data={data} />
        </div>

        {associateOrders.length > 0 && (
          <div className="col-span-6">
            <AssociateOrders
              quotationCode={data.quotation?.code ?? ""}
              data={associateOrders}
            />
          </div>
        )}
        <div className="col-span-6 md:col-span-3   mb-6">
          <DocumentItems refType="purchaseOrder" refId={data.id} />
        </div>
      </div>
    </>
  );
}
