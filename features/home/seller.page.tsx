import React from "react";
import Quotations from "./components/overview.quotations";
import ShortcutMenus from "./components/seller.shortcut-menus";
import { db } from "@/lib/db";
import { QuotationWithBuyer } from "@/types";
import { currentUser } from "@/lib/auth";
import Tasks from "./components/tasks";
import { SellerStats } from "@/components/stats";

async function GetData(): Promise<[QuotationWithBuyer[], QuotationWithBuyer[], { _sum: { totalPrice: number | null } }, number]> {
  const user = await currentUser();

  if (!user?.id) {
    return [[], [], { _sum: { totalPrice: 0 } }, 0];
  }

  const sellerId = parseInt(user.id);

  const tasks = db.quotation.findMany({
    include: {
      contact: true,
    },
    where: {
      status: "offer",
      sellerId: sellerId,
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
      sellerId: sellerId,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  // count all total price for current month
  const saleTotal = db.quotation.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      sellerId: sellerId,
      updatedAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });

  const res = await Promise.all([tasks, quotations, saleTotal]);
  return [...res, sellerId];
}
export default async function SellerHomePage({
  searchParams,
}: {
  readonly searchParams: { year?: string };
}) {
  const year = searchParams.year
    ? parseInt(searchParams.year)
    : new Date().getFullYear();
  
  const [tasks, quotations, stats, sellerId] = await GetData();

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

        <div className="col-span-12">
          <SellerStats sellerId={sellerId} year={year} />
        </div>
      </div>
    </div>
  );
}
