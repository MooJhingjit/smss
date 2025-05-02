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
    color: "hsl(var(--chart-1))",
  },
  salesWithoutVAT: {
    label: "ยอดขายไม่รวม VAT : ",
    color: "hsl(var(--chart-2))",
  },
  purchase: {
    label: "ยอดสั่งซื้อ : ",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

interface NewStatsProps {
  data: StatsData;
  year: number;
}

export function NewStats({ data, year }: NewStatsProps) {
  // Transform data format for recharts
  const chartData = data.labels.map((month, index) => ({
    month,
    salesWithVAT: data.datasets[0].data[index],
    salesWithoutVAT: data.datasets[1].data[index],
    purchase: data.datasets[2].data[index],
  }));

  // Calculate yearly totals for each data series
  const yearTotals = {
    salesWithVAT: chartData.reduce((sum, item) => sum + (item.salesWithVAT || 0), 0),
    salesWithoutVAT: chartData.reduce((sum, item) => sum + (item.salesWithoutVAT || 0), 0),
    purchase: chartData.reduce((sum, item) => sum + (item.purchase || 0), 0),
  };

  // Format numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
          <CardTitle className="flex items-start gap-2">
            <div className="space-y-1">
              <p>{`ยอดขาย และยอดสั่งซื้อทั้งปี`}</p>
            </div>
          </CardTitle>
          <div className="flex flex-col sm:flex-row  gap-2 md:gap-x-10">
            {Object.entries(chartConfig).map(([key, { label, color }]) => (
              <>
                <div key={key} className="">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm text-muted-foreground">{label} </span>
                  </div>
                  <span className="text-lg font-medium" style={{ color }}>
                    {formatNumber(yearTotals[key as keyof typeof yearTotals])}
                  </span>
                </div>
                <Separator orientation="vertical" />
              </>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
              dataKey="purchase"
              type="monotone"
              stroke="var(--color-purchase)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
