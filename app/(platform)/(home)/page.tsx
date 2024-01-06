import React from "react";
import CardWrapper from "./_components/card-wrapper";
import QuotationCard from "./_components/quotation-card";
import ShortcutMenus from "./_components/shortcut-menus";
import PurchaseOrders from "./_components/purchase-order-card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-2 xl:px-0">
      <div className="grid grid-cols-12 gap-6">
        <div className="md:col-span-4 col-span-12">
          <div className="relative h-full p-6 rounded-xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gray-700 opacity-10 z-10 h-full"></div>
            <div className="h-full w-full">
              <ShortcutMenus />
            </div>
          </div>
        </div>
        <div className="md:col-span-8 col-span-12">
          <CardWrapper title="Tasks" description="Tasks you need to do" />
        </div>
        <div className="lg:col-span-6 col-span-12">
          <QuotationCard />
        </div>
        <div className="lg:col-span-6 col-span-12">
          <PurchaseOrders />
        </div>
        <div className="col-span-12">
          <CardWrapper
            title="Statistics"
            description="The summary of Sales, Purchases, Expenses, and Income"
          />
        </div>
      </div>
    </div>
  );
}
