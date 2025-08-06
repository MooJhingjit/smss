"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MonthlyStatsData } from "@/lib/stats.service";

interface MonthlyStatisticsProps {
  readonly data: MonthlyStatsData[];
  readonly year: number;
}

export default function MonthlyStatistics({
  data,
  year,
}: MonthlyStatisticsProps) {
  const monthNames = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare chart data
  const chartData = monthNames.map((month, index) => ({
    month,
    unpaid: data[index]?.unpaid.withVAT || 0,
    paid: data[index]?.paid.withVAT || 0,
    installment: data[index]?.installment.withVAT || 0,
  }));

  const chartConfig = {
    unpaid: {
      label: " ยังไม่ชำระ",
      color: "#f97316", // orange-500
    },
    paid: {
      label: " ชำระแล้ว",
      color: "#15803d", // green-500
    },
    installment: {
      label: " ผ่อนชำระ",
      color: "#dc2626", // red-600
    },
  } satisfies ChartConfig;

  // Calculate totals
  const totals = data.reduce(
    (acc, monthData) => ({
      paid: {
        withVAT: acc.paid.withVAT + monthData.paid.withVAT,
        withoutVAT: acc.paid.withoutVAT + monthData.paid.withoutVAT,
      },
      unpaid: {
        withVAT: acc.unpaid.withVAT + monthData.unpaid.withVAT,
        withoutVAT: acc.unpaid.withoutVAT + monthData.unpaid.withoutVAT,
      },
      installment: {
        withVAT: acc.installment.withVAT + monthData.installment.withVAT,
        withoutVAT:
          acc.installment.withoutVAT + monthData.installment.withoutVAT,
      },
      purchaseOrder: (acc.purchaseOrder ?? 0) + (monthData.purchaseOrder ?? 0),
    }),
    {
      paid: { withVAT: 0, withoutVAT: 0 },
      unpaid: { withVAT: 0, withoutVAT: 0 },
      installment: { withVAT: 0, withoutVAT: 0 },
      purchaseOrder: 0,
    }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>สถิติรายเดือน {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">เดือน</th>
                <th className="text-center py-3 px-2 border-l border-r">
                  ยอดสั่งซื้อ
                </th>
                <th
                  className="text-center py-3 px-2 border-l border-r"
                  colSpan={2}
                >
                  ยอดขายที่ยังไม่ชำระ
                </th>
                <th className="text-center py-3 px-2 border-r" colSpan={2}>
                  ยอดขายที่ชำระแล้ว
                </th>
                  <th className="text-center py-3 px-2" colSpan={2}>
                  ผ่อนชำระ
                </th>
                <th className="text-center py-3 px-2 border-r" colSpan={2}>
                  รวมยอดขาย
                </th>
              
              </tr>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-2"></th>
                <th className="text-right py-2 px-2 text-xs border-l border-r">
                  รวม
                </th>
                <th className="text-right py-2 px-2 text-xs border-l">
                  รวม VAT
                </th>
                <th className="text-right py-2 px-2 text-xs border-r">
                  ไม่รวม VAT
                </th>
                <th className="text-right py-2 px-2 text-xs">รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs border-r">
                  ไม่รวม VAT
                </th>
                <th className="text-right py-2 px-2 text-xs">รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs border-r">
                  ไม่รวม VAT
                </th>
                <th className="text-right py-2 px-2 text-xs">รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs">ไม่รวม VAT</th>
              </tr>
            </thead>
            <tbody>
              {monthNames.map((month, index) => (
                <tr
                  key={`${month}-${year}`}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-2 px-2 font-medium">{month}</td>
                  <td className="py-2 px-2 text-right text-blue-600 border-l border-r">
                    {formatCurrency(data[index]?.purchaseOrder ?? 0)}
                  </td>
                  <td className="py-2 px-2 text-right text-orange-600 border-l">
                    {formatCurrency(data[index]?.unpaid.withVAT || 0)}
                  </td>
                  <td className="py-2 px-2 text-right text-orange-500 border-r">
                    {formatCurrency(data[index]?.unpaid.withoutVAT || 0)}
                  </td>
                  <td className="py-2 px-2 text-right text-green-700">
                    {formatCurrency(data[index]?.paid.withVAT || 0)}
                  </td>
                  <td className="py-2 px-2 text-right text-green-600 border-r">
                    {formatCurrency(data[index]?.paid.withoutVAT || 0)}
                  </td>

                  <td className="py-2 px-2 text-right text-red-700">
                    {formatCurrency(data[index]?.installment.withVAT || 0)}
                  </td>
                  <td className="py-2 px-2 text-right text-red-600  border-r">
                    {formatCurrency(data[index]?.installment.withoutVAT || 0)}
                  </td>

                  <td className="py-2 px-2 text-right text-purple-700 font-medium bg-gray-50">
                    {formatCurrency(
                      (data[index]?.unpaid.withVAT || 0) +
                        (data[index]?.paid.withVAT || 0) +
                        (data[index]?.installment.withVAT || 0)
                    )}
                  </td>
                  <td className="py-2 px-2 text-right text-purple-600 font-medium bg-gray-50">
                    {formatCurrency(
                      (data[index]?.unpaid.withoutVAT || 0) +
                        (data[index]?.paid.withoutVAT || 0) +
                        (data[index]?.installment.withoutVAT || 0)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold bg-gray-50">
                <td className="py-3 px-2">รวม</td>
                <td className="py-3 px-2 text-right text-blue-600 border-l border-r">
                  {formatCurrency(totals.purchaseOrder ?? 0)}
                </td>
                <td className="py-3 px-2 text-right text-orange-600 border-l">
                  {formatCurrency(totals.unpaid.withVAT)}
                </td>
                <td className="py-3 px-2 text-right text-orange-500 border-r">
                  {formatCurrency(totals.unpaid.withoutVAT)}
                </td>
                <td className="py-3 px-2 text-right text-green-700">
                  {formatCurrency(totals.paid.withVAT)}
                </td>
                <td className="py-3 px-2 text-right text-green-600 border-r">
                  {formatCurrency(totals.paid.withoutVAT)}
                </td>

                <td className="py-3 px-2 text-right text-red-700 font-semibold">
                  {formatCurrency(totals.installment.withVAT)}
                </td>
                <td className="py-3 px-2 text-right text-red-600 font-semibold border-r">
                  {formatCurrency(totals.installment.withoutVAT)}
                </td>

                <td className="py-3 px-2 text-right text-purple-700 font-bold">
                  {formatCurrency(totals.unpaid.withVAT + totals.paid.withVAT + totals.installment.withVAT)}
                </td>
                <td className="py-3 px-2 text-right text-purple-600 font-bold ">
                  {formatCurrency(
                    totals.unpaid.withoutVAT + totals.paid.withoutVAT + totals.installment.withoutVAT
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              เปรียบเทียบยอดขายที่ชำระแล้ว ยังไม่ชำระ และผ่อนชำระ (รวม VAT)
            </h3>
          </div>
          <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  chartConfig[name as keyof typeof chartConfig]?.label,
                ]}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="unpaid"
                stackId="a"
                fill="var(--color-unpaid)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="paid"
                stackId="a"
                fill="var(--color-paid)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="installment"
                stackId="a"
                fill="var(--color-installment)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
