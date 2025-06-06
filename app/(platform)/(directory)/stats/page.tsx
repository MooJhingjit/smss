import React from "react";
import { db } from "@/lib/db";
import { AnnualStatistics } from "./_component/annual-statistics";
// import StatChartB from "./_component/stat-chart-b";
import TotalNumber from "./_component/total-number";
import MonthlyStatistics from "./_component/monthly-statistics";

const labels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const getData = async (year = new Date().getUTCFullYear()) => {
  const salesData = await Promise.all(
    Array.from({ length: 12 }).map(async (_, month) => {
      const startDate = new Date(Date.UTC(year, month, 1));
      const endDate = new Date(Date.UTC(year, month + 1, 1)); // First day of next month (exclusive)

      const salesWithVAT = await db.quotation.aggregate({
        _sum: {
          grandTotal: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const salesWithoutVAT = await db.quotation.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      return {
        withVAT: Number(salesWithVAT._sum.grandTotal) || 0,
        withoutVAT: Number(salesWithoutVAT._sum.totalPrice) || 0,
      };
    })
  );

  const purchaseData = await Promise.all(
    Array.from({ length: 12 }).map(async (_, month) => {
      const startDate = new Date(Date.UTC(year, month, 1));
      const endDate = new Date(Date.UTC(year, month + 1, 1)); // First day of next month

      const purchaseAmount = await db.purchaseOrder.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          quotation: {
            isNot: null,
          },
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      return Number(purchaseAmount._sum.totalPrice) || 0;
    })
  );

  const labels = Array.from({ length: 12 }, (_, i) =>
    new Date(Date.UTC(year, i)).toLocaleString("default", { month: "short" })
  );

  return {
    labels,
    datasets: [
      {
        label: "ยอดขายรวม VAT",
        data: salesData.map((data) => data.withVAT),
      },
      {
        label: "ยอดขายไม่รวม VAT",
        data: salesData.map((data) => data.withoutVAT),
      },
      {
        label: "ยอดสั่งซื้อ",
        data: purchaseData,
      },
    ],
  };
};

const getTotalCounts = async (year = new Date().getUTCFullYear()) => {
  const startDate = new Date(Date.UTC(year, 0, 1)); // January 1st of the year
  const endDate = new Date(Date.UTC(year + 1, 0, 1)); // January 1st of next year

  const quotationCount = await db.quotation.count({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  const purchaseOrderCount = await db.purchaseOrder.count({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  return {
    quotationCount,
    purchaseOrderCount,
  };
};

export default async function StatPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const year = searchParams.year
    ? parseInt(searchParams.year)
    : new Date().getFullYear();
  const data = await getData(year);

  // Get total counts of quotations and purchase orders for the year
  const totals = await getTotalCounts(year);

  return (
    <div className="space-y-4">
      <TotalNumber
        year={year}
        quotationCount={totals.quotationCount}
        purchaseOrderCount={totals.purchaseOrderCount}
      />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <AnnualStatistics data={data} year={year} />
        </div>
        <div className="col-span-1">
          <MonthlyStatistics data={data} year={year} />
        </div>
      </div>
    </div>
  );
}
