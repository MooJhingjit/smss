import React from "react";
import CardWrapper from "./_components/card-wrapper";
import QuotationCard from "./_components/quotation-card";
import ShortcutMenus from "./_components/shortcut-menus";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <div className="relative h-full p-6 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gray-700 opacity-10 z-10 h-full"></div>
            <div className="h-full w-full">
              <ShortcutMenus />
            </div>
          </div>
        </div>
        <div className="col-span-8">
          <CardWrapper title="Tasks" description="Tasks you need to do" />
        </div>
        <div className="col-span-6">
          <QuotationCard />
        </div>
        <div className="col-span-6">
          <CardWrapper
            title="Purchase orders "
            description="Recents to 5 purchase orders ordered by date"
          />
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
