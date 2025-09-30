import React from "react";
import { getMonthlyStats, getTotalCounts, getDateRangeStats, getDateRangeTotalCounts } from "@/lib/stats.service";
import TotalNumber from "./_component/total-number";
import MonthlyStatistics from "./_component/monthly-statistics";

export default async function StatPage({
  searchParams,
}: {
  searchParams: { year?: string; from?: string; to?: string };
}) {
  // Handle date range or year-based filtering
  const hasDateRange = searchParams.from && searchParams.to;
  
  let data, totals, dateRange, year;
  
  if (hasDateRange) {
    // Use date range filtering
    // Parse dates and set to end of day for 'to' date to include the entire day
    const fromDate = new Date(searchParams.from!);
    const toDate = new Date(searchParams.to!);
    toDate.setHours(23, 59, 59, 999); // Set to end of day
    
    dateRange = {
      from: fromDate,
      to: toDate,
    };
    
    data = await getDateRangeStats({
      dateRange,
      includePurchaseOrders: true,
    });

    totals = await getDateRangeTotalCounts({
      dateRange,
      includePurchaseOrders: true,
    });
    
    // For display purposes, use the year from the start date
    year = dateRange.from.getFullYear();
  } else {
    // Use year-based filtering (existing logic)
    year = searchParams.year
      ? parseInt(searchParams.year)
      : new Date().getFullYear();
    
    dateRange = {
      from: new Date(year, 0, 1),
      to: new Date(year, 11, 31, 23, 59, 59, 999), // End of Dec 31st
    };
    
    data = await getMonthlyStats({
      year,
      includePurchaseOrders: true,
    });

    totals = await getTotalCounts({
      year,
      includePurchaseOrders: true,
    });
  }

  return (
    <div className="space-y-4">
      <TotalNumber
        year={year}
        dateRange={dateRange}
        hasDateRange={!!hasDateRange}
        quotationCount={totals.quotationCount}
        purchaseOrderCount={totals.purchaseOrderCount}
      />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 ">
          <MonthlyStatistics 
            data={data} 
            year={year} 
            dateRange={dateRange}
            hasDateRange={!!hasDateRange}
          />
        </div>
      </div>
    </div>
  );
}
