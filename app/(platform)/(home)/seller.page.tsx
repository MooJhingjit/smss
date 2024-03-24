import React from "react";
import Quotations from "./_components/overview.quotations";
import ShortcutMenus from "./_components/seller.shortcut-menus";
import StatisticCard from "./_components/statistics";
import { db } from "@/lib/db";
import { QuotationWithBuyer } from "@/types";
import { useUser } from "@/hooks/use-user";

async function getData(): Promise<QuotationWithBuyer[]> {
  const { info } = await useUser();

  if (!info?.id) {
    return [];
  }
  const quotations = await db.quotation.findMany({
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

  const data = await quotations;
  return data;
}
export default async function SellerHomePage() {
  const quotations = await getData();

  return (
    <div className="h-screen grid grid-cols-12 gap-6 ">
      <div className="md:col-span-6 col-span-12">
        <div className="relative p-5 rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gray-700 opacity-10 z-10 h-full"></div>
          <ShortcutMenus />
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
