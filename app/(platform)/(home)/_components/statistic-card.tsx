'use client'
import React from 'react'
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import { Line } from 'react-chartjs-2';

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};
const data = {
  labels,
  datasets: [
    {
      label: 'ยอดขาย',
      data: labels.map(() => {
        // random number 1000 - 1000000
        return Math.floor(Math.random() * 1000000) + 1000
      }),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'ยอดสั่งซื้อ',
      data: labels.map(() => {
        // random number 1000 - 1000000
        return Math.floor(Math.random() * 1000000) + 1000
      }),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

export default function StatisticCard() {
  return (
    <CardWrapper
      title="สถิติ"
      description="สถิติการใช้งานระบบ"
    >

      <Line options={options} data={data} />
    </CardWrapper>
  )
}
