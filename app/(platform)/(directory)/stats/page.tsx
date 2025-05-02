import React from "react";
import { db } from "@/lib/db";
import { NewStats } from "./_component/stat-chart";
import StatChartB from "./_component/stat-chart-b";

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

export default async function StatPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const year = searchParams.year
    ? parseInt(searchParams.year)
    : new Date().getFullYear();
  const data = await getData(year);

  return (
    <div className="space-y-4">
      <NewStats data={data} year={year} />
    </div>
  );
}
