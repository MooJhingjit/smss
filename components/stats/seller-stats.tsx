import React from "react";
import { getMonthlyStats, getTotalCounts } from "@/lib/stats.service";
import SellerMonthlyStatistics from "@/components/stats/seller-monthly-statistics";
import SellerTotalNumber from "@/components/stats/seller-total-number";

interface SellerStatsProps {
  readonly sellerId: number;
  readonly year?: number;
}

export default async function SellerStats({ sellerId, year }: SellerStatsProps) {
  const selectedYear = year ?? new Date().getFullYear();
  
  // Get monthly data for seller (without purchase orders)
  const data = await getMonthlyStats({
    year: selectedYear,
    sellerId,
    includePurchaseOrders: false,
  });

  // Get total counts for seller
  const totals = await getTotalCounts({
    year: selectedYear,
    sellerId,
    includePurchaseOrders: false,
  });

  return (
    <div className="space-y-4">
      <SellerTotalNumber
        year={selectedYear}
        quotationCount={totals.quotationCount}
      />
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1">
          <SellerMonthlyStatistics data={data} year={selectedYear} />
        </div>
      </div>
    </div>
  );
}
