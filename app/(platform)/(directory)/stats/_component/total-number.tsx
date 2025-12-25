"use client";

import { TimePeriodSelector } from "@/components/stats";

export default function TotalNumber({
  year,
  dateRange,
  hasDateRange,
  hasQuarter,
  quarter,
  quotationCount,
  purchaseOrderCount,
}: {
  year: number;
  dateRange: { from: Date; to: Date };
  hasDateRange: boolean;
  hasQuarter: boolean;
  quarter: number;
  quotationCount: number;
  purchaseOrderCount: number;
}) {
  // Generate dynamic labels based on the time period mode
  // const getLabel = (type: string) => {
  //   if (hasQuarter) {
  //     return `${type} (ไตรมาส ${quarter})`;
  //   }
  //   if (hasDateRange) {
  //     return `${type} (ในช่วงเวลา)`;
  //   }
  //   return `${type}ทั้งปี`;
  // };

  const stats = [
    { name: "ใบเสนอราคา", value: quotationCount.toString() },
    { name: "ใบสั่งซื้อ", value: purchaseOrderCount.toString() },
  ];
  return (
    <div>
      {/* Time Period Selector */}

      <div className="grid grid-cols-8 gap-6">
        <div className="col-span-8 md:col-span-6">
          <TimePeriodSelector
            year={year}
            dateRange={dateRange}
            hasDateRange={hasDateRange}
            hasQuarter={hasQuarter}
            quarter={quarter}
          />
        </div>
        <div
          className="col-span-8 md:col-span-2 flex  px-4 py-6 sm:px-6 xl:px-8 border rounded-xl flex w-full"
        >

          {stats.map((stat) => (
            <div
              className="flex-1 flex flex-col items-center justify-center"
              key={stat.name}
            >
              <div className="text-sm/6 font-medium text-gray-500">{stat.name}</div>
              <div className="text-3xl/10 font-medium tracking-tight text-gray-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
