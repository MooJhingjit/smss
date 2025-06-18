import React from "react";
import { getMonthlyStats, getTotalCounts } from "@/lib/stats.service";
import TotalNumber from "./_component/total-number";
import MonthlyStatistics from "./_component/monthly-statistics";

export default async function StatPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const year = searchParams.year
    ? parseInt(searchParams.year)
    : new Date().getFullYear();
  
  // Use the shared service with purchase orders included
  const data = await getMonthlyStats({
    year,
    includePurchaseOrders: true,
  });

  // Get total counts including purchase orders
  const totals = await getTotalCounts({
    year,
    includePurchaseOrders: true,
  });

  return (
    <div className="space-y-4">
      <TotalNumber
        year={year}
        quotationCount={totals.quotationCount}
        purchaseOrderCount={totals.purchaseOrderCount}
      />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 ">
          <MonthlyStatistics data={data} year={year} />
        </div>
      </div>
    </div>
  );
}
