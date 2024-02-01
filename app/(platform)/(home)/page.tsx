import React from "react";
import CardWrapper from "./_components/card-wrapper";
import QuotationCard from "./_components/quotation-card";
import ShortcutMenus from "./_components/shortcut-menus";
import PurchaseOrders from "./_components/purchase-order-card";
import { db } from "@/lib/db";
import { PurchaseOrderWithRelations, QuotationWithBuyer } from "@/types";
import { PurchaseOrder, User } from "@prisma/client";


export type PurchaseOrderWithVendor = PurchaseOrder & { vendor: User }

async function getData(): Promise<[QuotationWithBuyer[], PurchaseOrderWithVendor[]]> {
  const quotations = db.quotation.findMany({
    include: {
      buyer: true,
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const purchaseOrders = db.purchaseOrder.findMany({
    include: {
      vendor: true,
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const data = await Promise.all([quotations, purchaseOrders]);
  return data;

}

export default async function HomePage() {
  const [qt, po] = await getData();

  return (
    <div className="mx-auto max-w-6xl px-2 xl:px-0">
      <div className="grid grid-cols-12 gap-6">
        <div className="md:col-span-5 col-span-12">
          <div className="relative h-full p-6 rounded-xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gray-700 opacity-10 z-10 h-full"></div>
            <div className="h-full w-full">
              <ShortcutMenus />
            </div>
          </div>
        </div>
        <div className="md:col-span-7 col-span-12">
          <CardWrapper title="งานที่ต้องตรวจสอบ" description="ตรวจสอบในเสนอราคา และอื่นๆ" />
        </div>
        <div className="lg:col-span-6 col-span-12">
          <QuotationCard data={qt} />
        </div>
        <div className="lg:col-span-6 col-span-12">
          <PurchaseOrders data={po} />
        </div>
        <div className="col-span-12">
          <CardWrapper
            title="สถิติ"
            description="สถิติการใช้งานระบบ"
          />
        </div>
      </div>
    </div>
  );
}
