"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator";
import YearSelector from "./year-selector";

interface StatsData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    // borderColor: string;
    // backgroundColor: string;
  }[];
}

// Chart configuration
const chartConfig = {
  salesWithVAT: {
    label: "ยอดขายรวม VAT : ",
    color: "#16a34a", // green-600
  },
  salesWithoutVAT: {
    label: "ยอดขายไม่รวม VAT : ",
    color: "#2563eb", // blue-600
  },
  salesData: {
    label: "ยอดขายที่ชำระแล้ว : ",
    color: "#9333ea", // purple-600
  },
  purchase: {
    label: "ยอดสั่งซื้อ : ",
    color: "#ea580c", // orange-600
  },
} satisfies ChartConfig

interface NewStatsProps {
  data: StatsData;
  year: number;
}

export function AnnualStatistics({ data, year }: NewStatsProps) {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  // Transform data format for recharts
  const chartData = data.labels.map((month, index) => ({
    month: thaiMonths[index] || month,
    salesWithVAT: data.datasets[0].data[index],
    salesWithoutVAT: data.datasets[1].data[index],
    salesData: data.datasets[2].data[index],
    purchase: data.datasets[3].data[index],
  }));

  // // Calculate yearly totals for each data series
  // const yearTotals = {
  //   salesWithVAT: chartData.reduce((sum, item) => sum + (item.salesWithVAT || 0), 0),
  //   salesWithoutVAT: chartData.reduce((sum, item) => sum + (item.salesWithoutVAT || 0), 0),
  //   purchase: chartData.reduce((sum, item) => sum + (item.purchase || 0), 0),
  // };

  // // Format numbers for display
  // const formatNumber = (num: number) => {
  //   return new Intl.NumberFormat('th-TH').format(num);
  // };

  return (
 
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-h-[500px]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="salesWithVAT"
              type="monotone"
              stroke="var(--color-salesWithVAT)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="salesWithoutVAT"
              type="monotone"
              stroke="var(--color-salesWithoutVAT)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="salesData"
              type="monotone"
              stroke="var(--color-salesData)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="purchase"
              type="monotone"
              stroke="var(--color-purchase)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
  )
}
