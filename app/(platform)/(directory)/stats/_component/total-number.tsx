"use client";

import { TimePeriodSelector } from "@/components/stats";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function TotalNumber({
  year,
  dateRange,
  hasDateRange,
  quotationCount,
  purchaseOrderCount,
}: {
  year: number;
  dateRange: { from: Date; to: Date };
  hasDateRange: boolean;
  quotationCount: number;
  purchaseOrderCount: number;
}) {
  // Generate dynamic labels based on the date range
  const getLabel = (type: string) => {
    if (hasDateRange) {
    //   const fromStr = format(dateRange.from, "dd MMM yyyy", { locale: th });
    //   const toStr = format(dateRange.to, "dd MMM yyyy", { locale: th });
      return `${type} (ในช่วงเวลา)`;
    }
    return `${type}ทั้งปี`;
  };

  const stats = [
    { name: getLabel("ใบเสนอราคา"), value: quotationCount.toString() },
    { name: getLabel("ใบสั่งซื้อ"), value: purchaseOrderCount.toString() },
  ];
  return (
    <div>
      {/* Time Period Selector */}

      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-6 md:col-span-4">
          <TimePeriodSelector
            year={year}
            dateRange={dateRange}
            hasDateRange={hasDateRange}
          />
        </div>

        {stats.map((stat) => (
          <div
            key={stat.name}
            className="col-span-3 md:col-span-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-6 sm:px-6 xl:px-8 border rounded-xl"
          >
            <dt className="text-sm/6 font-medium text-gray-500">{stat.name}</dt>
            <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}
