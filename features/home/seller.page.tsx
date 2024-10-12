import React from "react";
import Quotations from "./components/overview.quotations";
import ShortcutMenus from "./components/seller.shortcut-menus";
import StatisticCard from "./components/statistics";
import { db } from "@/lib/db";
import { QuotationWithBuyer } from "@/types";
import { useUser } from "@/hooks/use-user";
import Tasks from "./components/tasks";
import { quotationStatusMapping } from "@/app/config";

async function GetData(): Promise<[QuotationWithBuyer[], QuotationWithBuyer[], { _sum: { totalPrice: number | null } }]> {
  const { info } = await useUser();

  if (!info?.id) {
    return [[], [], { _sum: { totalPrice: 0 } }];
  }

  const tasks = db.quotation.findMany({
    include: {
      contact: true,
    },
    where: {
      status: "offer",
      sellerId: parseInt(info.id),
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const quotations = db.quotation.findMany({
    include: {
      contact: true,
    },
    where: {
      sellerId: parseInt(info.id),
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  // count all total price for current month
  const saleTotal = db.quotation.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      sellerId: parseInt(info.id),
      updatedAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });

  const res = await Promise.all([tasks, quotations, saleTotal]);
  return res;

}
export default async function SellerHomePage() {
  const [tasks, quotations, stats] = await GetData();

  return (
    <div className="h-screen ">

      
      <div className="grid grid-cols-12 gap-6 ">
        <div className="md:col-span-5 col-span-12">
          <div className="relative rounded-xl overflow-hidden ">
            <ShortcutMenus saleTotal={stats._sum.totalPrice ?? 0} />
          </div>
        </div>
        <div className="md:col-span-7 col-span-12">
          <Tasks
            data={tasks}
            label={`QT ที่ได้รับการอนุมัติแล้ว พร้อมส่งใบเสนอราคาให้ลูกค้า`}
          />
        </div>
        <div className="col-span-12">
          <Quotations data={quotations} />
        </div>
        <div className="col-span-12 ">
          <StatisticCard />
        </div>
      </div>
    </div>
  );
}
