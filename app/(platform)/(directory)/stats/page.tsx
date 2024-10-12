import React from "react";
import CardWrapper from "../../../../features/home/components/card-wrapper";

import StatChart from "./_component/stat-chart";
import { db } from "@/lib/db";

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

const getData = async () => {
  // get all sales on each month in a year
  //   const saleTotal = db.quotation.aggregate({
  //     _sum: {
  //       totalPrice: true,
  //     },
  //     where: {
  //       updatedAt: {
  //         gte: new Date(new Date().getFullYear(), 0, 1),
  //       },
  //     },
  //     groupBy: {
  //       updatedAt: {
  //         month: true,
  //       },
  //     },
  //   });

  return {
    labels,
    datasets: [
      {
        label: "ยอดขาย",
        data: labels.map(() => {
          return Math.floor(Math.random() * 1000000) + 1000;
        }),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "ยอดสั่งซื้อ",
        data: labels.map(() => {
          return Math.floor(Math.random() * 1000000) + 1000;
        }),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };
};

export default async function StatPage() {
  const data = await getData();
  return (
    <CardWrapper title="ยอดขาย และยอดสั่งซื้อทั้งปี">
      <StatChart data={data} />
    </CardWrapper>
  );
}
