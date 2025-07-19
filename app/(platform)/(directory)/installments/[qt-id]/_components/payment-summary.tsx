"use client";

import { Card, CardContent } from "@/components/ui/card";
import { QuotationInstallment } from "@prisma/client";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface PaymentSummaryProps {
  installments: QuotationInstallment[];
}

export default function PaymentSummary({ installments }: PaymentSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalInstallmentAmount = installments.reduce((sum, item) => sum + item.amountWithVat, 0);
  const paidAmount = installments
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amountWithVat, 0);
  const remainingAmount = totalInstallmentAmount - paidAmount;
  const paymentPercentage = totalInstallmentAmount > 0 
    ? Math.round((paidAmount / totalInstallmentAmount) * 100) 
    : 0;

  // Chart data for payment progress
  const chartData = [
    {
      name: "paid",
      value: paymentPercentage,
      fill: "var(--color-paid)",
    },
  ];

  const chartConfig = {
    value: {
      label: "Payment Progress",
    },
    paid: {
      label: "ชำระแล้ว",
      color: "hsl(142 76% 36%)", // green color
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col justify-center items-center">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[150px]"
            >
              <RadialBarChart
                data={chartData}
                startAngle={0}
                endAngle={paymentPercentage * 3.6} // Convert percentage to degrees
                innerRadius={60}
                outerRadius={90}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[66, 54]}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {paymentPercentage}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-sm"
                            >
                              ชำระแล้ว
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </div>

          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">ยอดรวมแผนการผ่อน</p>
              <p className="text-xl font-bold">
                {formatCurrency(totalInstallmentAmount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">ชำระแล้ว</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">คงเหลือ</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
