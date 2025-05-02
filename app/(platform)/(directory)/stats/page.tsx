import React from "react";
import { db } from "@/lib/db";
import { NewStats } from "./_component/stat-chart";

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

const getData = async (year = new Date().getFullYear()) => {
  // Get sales data with and without VAT
  const salesData = await Promise.all(
    Array.from({ length: 12 }, async (_, month) => {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      // For sales with VAT (grandTotal)
      const salesWithVAT = await db.quotation.aggregate({
        _sum: {
          grandTotal: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // For sales without VAT (totalPrice)
      const salesWithoutVAT = await db.quotation.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return {
        withVAT: Number(salesWithVAT._sum.grandTotal) || 0,
        withoutVAT: Number(salesWithoutVAT._sum.totalPrice) || 0,
      };
    })
  );

  // Get purchase order data
  const purchaseData = await Promise.all(
    Array.from({ length: 12 }, async (_, month) => {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const purchaseAmount = await db.purchaseOrder.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return Number(purchaseAmount._sum.totalPrice) || 0;
    })
  );

  return {
    labels,
    datasets: [
      {
        label: "ยอดขายรวม VAT",
        data: salesData.map((data) => data.withVAT),
        // borderColor: "rgb(255, 99, 132)",
        // backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "ยอดขายไม่รวม VAT",
        data: salesData.map((data) => data.withoutVAT),
        // borderColor: "rgb(75, 192, 192)",
        // backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "ยอดสั่งซื้อ",
        data: purchaseData,
        // borderColor: "rgb(53, 162, 235)",
        // backgroundColor: "rgba(53, 162, 235, 0.5)",
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
