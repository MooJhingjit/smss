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
  const monthlyData = await Promise.all(
    Array.from({ length: 12 }).map(async (_, month) => {
      const startDate = new Date(Date.UTC(year, month, 1));
      const endDate = new Date(Date.UTC(year, month + 1, 1)); // First day of next month (exclusive)

      // Paid transactions
      const paidWithVAT = await db.quotation.aggregate({
        _sum: {
          grandTotal: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: "paid",
        },
      });

      const paidWithoutVAT = await db.quotation.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: "paid",
        },
      });

      // Unpaid transactions
      const unpaidWithVAT = await db.quotation.aggregate({
        _sum: {
          grandTotal: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: {
            not: "paid",
          },
        },
      });

      const unpaidWithoutVAT = await db.quotation.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: {
            not: "paid",
          },
        },
      });

      // Purchase Order data
      const purchaseOrder = await db.purchaseOrder.aggregate({
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

      return {
        paid: {
          withVAT: Number(paidWithVAT._sum.grandTotal) || 0,
          withoutVAT: Number(paidWithoutVAT._sum.totalPrice) || 0,
        },
        unpaid: {
          withVAT: Number(unpaidWithVAT._sum.grandTotal) || 0,
          withoutVAT: Number(unpaidWithoutVAT._sum.totalPrice) || 0,
        },
        purchaseOrder: Number(purchaseOrder._sum.totalPrice) || 0,
      };
    })
  );

  return monthlyData;
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

        <div className="col-span-3 ">
          <MonthlyStatistics data={data} year={year} />
        </div>
      </div>
    </div>
  );
}
