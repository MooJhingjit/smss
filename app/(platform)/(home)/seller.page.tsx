import React from "react";
import Quotations from "./_components/overview.quotations";
import ShortcutMenus from "./_components/seller.shortcut-menus";
import StatisticCard from "./_components/statistics";
import { db } from "@/lib/db";
import { QuotationWithBuyer } from "@/types";
import { useUser } from "@/hooks/use-user";

async function GetData(): Promise<[QuotationWithBuyer[], { _sum: { totalPrice: number | null } }]> {
  const { info } = await useUser();

  if (!info?.id) {
    return [[], { _sum: { totalPrice: 0 } }];
  }
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

  const res = await Promise.all([quotations, saleTotal]);
  return res;

}
export default async function SellerHomePage() {
  const [quotations, stats] = await GetData();

  return (
    <div className="h-screen grid grid-cols-12 gap-6 ">
      <div className="md:col-span-6 col-span-12">
        <div className="relative p-5 rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gray-700 opacity-10 z-10 h-full"></div>
          <ShortcutMenus saleTotal={stats._sum.totalPrice ?? 0} />
        </div>
      </div>
      <div className="md:col-span-6 col-span-12">
        <Quotations data={quotations} />
      </div>
      <div className="col-span-12 ">
        <StatisticCard />
      </div>
    </div>
  );
}
