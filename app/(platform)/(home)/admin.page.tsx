import React from "react";
import Quotations from "./_components/overview.quotations";
import ShortcutMenus from "./_components/shortcut-menus";
import PurchaseOrders from "./_components/overview.purchase-orders";
import { db } from "@/lib/db";
import { QuotationWithBuyer } from "@/types";
import { PurchaseOrder, User } from "@prisma/client";
import StatisticCard from "./_components/statistics";
import Tasks from "./_components/tasks";
import { currentUser } from "@/lib/auth";

export type PurchaseOrderWithVendor = PurchaseOrder & { vendor: User };

async function getData(): Promise<
  [QuotationWithBuyer[], PurchaseOrderWithVendor[], QuotationWithBuyer[]]
> {
  const quotations = db.quotation.findMany({
    include: {
      contact: true,
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const tasks = db.quotation.findMany({
    include: {
      contact: true,
    },
    where: {
      status: "pending_approval",
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

  const data = await Promise.all([quotations, purchaseOrders, tasks]);
  return data;
}

export default async function AdminHomePage() {
  const [quotations, purchaseOrders, tasks] = await getData();
  const user = await currentUser();
  // console.log('server get session >>>>>', user);
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="md:col-span-6 col-span-12">
        <div className="relative h-full p-6 rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gray-700 opacity-10 z-10 h-full"></div>
          <div className="h-full w-full">
            <ShortcutMenus />
          </div>
        </div>
      </div>
      <div className="md:col-span-6 col-span-12">
        <Tasks data={tasks} />
      </div>
      <div className="lg:col-span-6 col-span-12">
        <Quotations data={quotations} />
      </div>
      <div className="lg:col-span-6 col-span-12">
        <PurchaseOrders data={purchaseOrders} />
      </div>
      <div className="col-span-12">
        <StatisticCard />
      </div>
    </div>
  );
}
