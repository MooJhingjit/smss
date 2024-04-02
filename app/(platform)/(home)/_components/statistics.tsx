"use client";
import React from "react";
import CardWrapper from "./card-wrapper";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";

import STAT_SERVICE from '@/app/services/service.stat';
import { useQuery } from "@tanstack/react-query";

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
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Chart.js Line Chart",
    },
  },
};
const data = {
  labels,
  datasets: [
    {
      label: "ยอดขาย",
      data: labels.map(() => {
        // random number 1000 - 1000000
        return Math.floor(Math.random() * 1000000) + 1000;
      }),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "ยอดสั่งซื้อ",
      data: labels.map(() => {
        // random number 1000 - 1000000
        return Math.floor(Math.random() * 1000000) + 1000;
      }),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

export default function StatisticCard() {
  const [showReport, setShowReport] = React.useState(false);

  const handleShowReport = () => {

    setShowReport(true);
  }

  const { data } = useQuery({
    queryKey: ['full-year-stats'],
    queryFn: async () => {
      return await STAT_SERVICE.get();
    },
  });
  console.log(data)

  if (!showReport) {

    return (
      <CardWrapper title="ยอดขาย และยอดสั่งซื้อทั้งปี">
        <div className="h-auto relative overflow-hidden w-full flex items-center justify-center pt-6">
          <Button
            onClick={handleShowReport}
            variant="secondary">ดูรายงาน</Button>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper title="ยอดขาย และยอดสั่งซื้อทั้งปี">
      <Line options={options} data={data} />
    </CardWrapper>
  );
}
