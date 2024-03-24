import React from "react";
import Quotations from "./_components/overview.quotations";
import ShortcutMenus from "./_components/seller.shortcut-menus";
import StatisticCard from "./_components/statistics";

export default function SellerHomePage() {
  return (
    <div className="h-screen">
      <div className="md:col-span-6 col-span-12">
        <div className="relative h-full p-6 rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gray-700 opacity-10 z-10 h-full"></div>
          <div className="h-full w-full">
            <ShortcutMenus />
          </div>
        </div>
      </div>
      <div className="col-span-12 pt-8">
        <Quotations data={[]} />
      </div>
      <div className="col-span-12 pt-8">
        <StatisticCard />
      </div>
    </div>
  );
}
