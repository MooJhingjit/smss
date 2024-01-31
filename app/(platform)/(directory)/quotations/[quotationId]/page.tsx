import React from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import CustomerInfo from "./_components/customer-details";
import QuotationTools from "./_components/quotation-tools";
import QuotationLists from "./_components/quotation-lists";
import DocumentItems from "./_components/document-lists";
import PurchaseOrders from "./_components/purchase-orders";
import { db } from "@/lib/db";
import { QuotationListWithRelations } from "@/types";

const getData = async (quotationId: string) => {
  const data = await db.quotation.findUnique({
    where: {
      id: parseInt(quotationId),
    },
    include: {
      buyer: true,
      seller: true,
      purchaseOrders: {
        include: {
          vendor: true,
        },
      },
      lists: {
        include: {
          product: true,
        },
      },
    },
  });
  return data;
};

interface QuotationIdPageProps {
  params: {
    quotationId: string;
  };
}

export default async function QuotationDetails(
  props: Readonly<QuotationIdPageProps>,
) {
  const { params } = props;
  const data = await getData(params.quotationId);

  const pages = [
    {
      name: "Quotations",
      href: "/quotations",
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
        <p className="text-gray-500 text-sm">Quotation not found</p>
      </div>
    );
  }

  const {
    buyer,
    lists,
  } = data;
  return (
    <>
      <Breadcrumbs pages={pages} />
      <div className="grid grid-cols-5 gap-8 mt-6">
        <div className="col-span-3">
          {buyer && <CustomerInfo data={buyer} />}
        </div>
        <div className="col-span-2">
          <QuotationTools status={data.status} type={data.type} />
        </div>
        <div className="col-span-5">
          <QuotationLists
            quotationId={data.id}
            remark={data.remark ?? ""}
            data={lists as QuotationListWithRelations[]} />
        </div>
        <div className="col-span-5 md:col-span-2">
          <DocumentItems />
        </div>
        <div className="col-span-5 md:col-span-3">
          <PurchaseOrders
            hasQuotationItems={lists.length > 0}
            quotationId={data.id}
          />
        </div>
      </div>
    </>
  );
}
