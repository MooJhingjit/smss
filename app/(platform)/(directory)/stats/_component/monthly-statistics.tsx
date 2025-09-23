"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MonthlyStatsData } from "@/lib/stats.service";
import { useStatsDetailsModal } from "@/hooks/use-stats-details-modal";

interface MonthlyStatisticsProps {
  readonly data: MonthlyStatsData[];
  readonly year: number;
  readonly dateRange?: {
    from: Date;
    to: Date;
  };
  readonly hasDateRange?: boolean;
}

export default function MonthlyStatistics({ data, year, dateRange, hasDateRange }: MonthlyStatisticsProps) {
  const statsModal = useStatsDetailsModal();

  const allMonthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  // Generate months based on date range or show all months for year view
  const getDisplayMonths = () => {
    if (!hasDateRange || !dateRange) {
      // Show all 12 months for year view
      return allMonthNames.map((name, index) => ({
        name,
        index,
        dataIndex: index,
        year: year
      }));
    }

    // For date range view, only show months within the range
    const fromMonth = dateRange.from.getMonth();
    const toMonth = dateRange.to.getMonth();
    const fromYear = dateRange.from.getFullYear();
    const toYear = dateRange.to.getFullYear();

    const months: Array<{name: string; index: number; dataIndex: number; year: number}> = [];
    let currentDate = new Date(fromYear, fromMonth, 1);
    let dataIndex = 0;

    while (currentDate <= new Date(toYear, toMonth, 1)) {
      const monthIndex = currentDate.getMonth();
      months.push({
        name: allMonthNames[monthIndex],
        index: monthIndex,
        dataIndex: dataIndex,
        year: currentDate.getFullYear()
      });
      
      dataIndex++;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };

  const displayMonths = getDisplayMonths();

  const chartData = displayMonths.map((monthInfo) => ({
    month: monthInfo.name,
    unpaid: data[monthInfo.dataIndex]?.unpaid.withVAT || 0,
    paid: data[monthInfo.dataIndex]?.paid.withVAT || 0,
    installment: data[monthInfo.dataIndex]?.installment.withVAT || 0,
  }));

  const chartConfig = {
    unpaid: { label: " ยังไม่ชำระ", color: "#f97316" },
    paid: { label: " ชำระแล้ว", color: "#15803d" },
    installment: { label: " ผ่อนชำระ", color: "#dc2626" },
  } satisfies ChartConfig;

  // Calculate totals only for the displayed months
  const totals = displayMonths.reduce(
    (acc, monthInfo) => {
      const monthData = data[monthInfo.dataIndex];
      if (!monthData) return acc;
      
      return {
        paid: { 
          withVAT: acc.paid.withVAT + monthData.paid.withVAT, 
          withoutVAT: acc.paid.withoutVAT + monthData.paid.withoutVAT 
        },
        unpaid: { 
          withVAT: acc.unpaid.withVAT + monthData.unpaid.withVAT, 
          withoutVAT: acc.unpaid.withoutVAT + monthData.unpaid.withoutVAT 
        },
        installment: { 
          withVAT: acc.installment.withVAT + monthData.installment.withVAT, 
          withoutVAT: acc.installment.withoutVAT + monthData.installment.withoutVAT 
        },
        purchaseOrder: acc.purchaseOrder + (monthData.purchaseOrder ?? 0),
      };
    },
    { paid: { withVAT: 0, withoutVAT: 0 }, unpaid: { withVAT: 0, withoutVAT: 0 }, installment: { withVAT: 0, withoutVAT: 0 }, purchaseOrder: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {hasDateRange && dateRange ? (
            `สถิติรายเดือน (${new Intl.DateTimeFormat('th-TH', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }).format(dateRange.from)} - ${new Intl.DateTimeFormat('th-TH', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }).format(dateRange.to)})`
          ) : (
            `สถิติรายเดือน ${year}`
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">เดือน</th>
                <th className="text-center py-3 px-2 border-l border-r">ยอดสั่งซื้อ</th>
                <th className="text-center py-3 px-2 border-l border-r" colSpan={2}>ยอดขายที่ยังไม่ชำระ</th>
                <th className="text-center py-3 px-2 border-r" colSpan={2}>ยอดขายที่ชำระแล้ว</th>
                <th className="text-center py-3 px-2" colSpan={2}>ผ่อนชำระ</th>
                <th className="text-center py-3 px-2 border-r" colSpan={2}>รวมยอดขาย</th>
              </tr>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-2"></th>
                <th className="text-right py-2 px-2 text-xs border-l border-r">รวม</th>
                <th className="text-right py-2 px-2 text-xs border-l">รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs border-r">ไม่รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs">รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs border-r">ไม่รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs">รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs border-r">ไม่รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs">รวม VAT</th>
                <th className="text-right py-2 px-2 text-xs">ไม่รวม VAT</th>
              </tr>
            </thead>
            <tbody>
              {displayMonths.map((monthInfo) => {
                const monthData = data[monthInfo.dataIndex];
                const displayYear = hasDateRange && monthInfo.year ? monthInfo.year : year;
                
                return (
                  <tr key={`${monthInfo.name}-${displayYear}`} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">
                      {monthInfo.name}
                      {hasDateRange && monthInfo.year !== year && (
                        <span className="text-xs text-gray-500 ml-1">({monthInfo.year})</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right text-blue-600 border-l border-r">{formatCurrency(monthData?.purchaseOrder ?? 0)}</td>
                    <td className="py-2 px-2 text-right text-orange-600 border-l">{formatCurrency(monthData?.unpaid.withVAT || 0)}</td>
                    <td className="py-2 px-2 text-right text-orange-500 border-r">{formatCurrency(monthData?.unpaid.withoutVAT || 0)}</td>
                    <td className="py-2 px-2 text-right text-green-700">{formatCurrency(monthData?.paid.withVAT || 0)}</td>
                    <td className="py-2 px-2 text-right text-green-600 border-r">{formatCurrency(monthData?.paid.withoutVAT || 0)}</td>
                    <td className="py-2 px-2 text-right text-red-700">{formatCurrency(monthData?.installment.withVAT || 0)}</td>
                    <td className="py-2 px-2 text-right text-red-600  border-r">{formatCurrency(monthData?.installment.withoutVAT || 0)}</td>
                    <td className="py-2 px-2 text-right text-purple-700 font-medium bg-gray-50">{formatCurrency((monthData?.unpaid.withVAT || 0) + (monthData?.paid.withVAT || 0) + (monthData?.installment.withVAT || 0))}</td>
                    <td className="py-2 px-2 text-right text-purple-600 font-medium bg-gray-50">{formatCurrency((monthData?.unpaid.withoutVAT || 0) + (monthData?.paid.withoutVAT || 0) + (monthData?.installment.withoutVAT || 0))}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold bg-gray-50">
                <td className="py-3 px-2">รวม</td>
                <td className="py-3 px-2 text-right text-blue-600 border-l border-r">{formatCurrency(totals.purchaseOrder ?? 0)}</td>
                <td className="py-3 px-2 text-right text-orange-600 border-l">{formatCurrency(totals.unpaid.withVAT)}</td>
                <td className="py-3 px-2 text-right text-orange-500 border-r">{formatCurrency(totals.unpaid.withoutVAT)}</td>
                <td className="py-3 px-2 text-right text-green-700">{formatCurrency(totals.paid.withVAT)}</td>
                <td className="py-3 px-2 text-right text-green-600 border-r">{formatCurrency(totals.paid.withoutVAT)}</td>
                <td className="py-3 px-2 text-right text-red-700 font-semibold">{formatCurrency(totals.installment.withVAT)}</td>
                <td className="py-3 px-2 text-right text-red-600 font-semibold border-r">{formatCurrency(totals.installment.withoutVAT)}</td>
                <td className="py-3 px-2 text-right text-purple-700 font-bold">{formatCurrency(totals.unpaid.withVAT + totals.paid.withVAT + totals.installment.withVAT)}</td>
                <td className="py-3 px-2 text-right text-purple-600 font-bold ">{formatCurrency(totals.unpaid.withoutVAT + totals.paid.withoutVAT + totals.installment.withoutVAT)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">เปรียบเทียบยอดขายที่ชำระแล้ว ยังไม่ชำระ และผ่อนชำระ (รวม VAT)</h3>
          </div>
          <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} formatter={(value, name) => [formatCurrency(Number(value)), chartConfig[name as keyof typeof chartConfig]?.label]} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="unpaid" stackId="a" fill="var(--color-unpaid)" radius={[0, 0, 0, 0]}
                onClick={(_, index) => {
                  const monthInfo = displayMonths[index];
                  if (monthInfo) {
                    statsModal.onOpen({ 
                      year: monthInfo.year || year, 
                      month: monthInfo.index, 
                      monthLabel: monthInfo.name, 
                      initialTab: "unpaid" 
                    });
                  }
                }}
              />
              <Bar dataKey="paid" stackId="a" fill="var(--color-paid)" radius={[0, 0, 0, 0]}
                onClick={(_, index) => {
                  const monthInfo = displayMonths[index];
                  if (monthInfo) {
                    statsModal.onOpen({ 
                      year: monthInfo.year || year, 
                      month: monthInfo.index, 
                      monthLabel: monthInfo.name, 
                      initialTab: "paid" 
                    });
                  }
                }}
              />
              <Bar dataKey="installment" stackId="a" fill="var(--color-installment)" radius={[4, 4, 0, 0]}
                onClick={(_, index) => {
                  const monthInfo = displayMonths[index];
                  if (monthInfo) {
                    statsModal.onOpen({ 
                      year: monthInfo.year || year, 
                      month: monthInfo.index, 
                      monthLabel: monthInfo.name, 
                      initialTab: "installment" 
                    });
                  }
                }}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

