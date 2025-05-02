"use client";
import React from "react";
import CardWrapper from "./card-wrapper";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

// export const options = {
//   responsive: true,
//   plugins: {
//     legend: {
//       position: "top" as const,
//     },
//     title: {
//       display: true,
//       text: "Chart.js Line Chart",
//     },
//   },
// };

export default function StatisticCard() {
  return (
    <CardWrapper title="ยอดขาย และยอดสั่งซื้อทั้งปี">
      <div className="h-auto relative overflow-hidden w-full flex items-center justify-center pt-6">
        <Link
          role="button"
          target="_blank"
          href="/stats"
          className="flex items-center"
        >
          <p>ดูรายงาน</p>
          <ExternalLink className="ml-2 w-5" />
        </Link>
      </div>
    </CardWrapper>
  );
}
