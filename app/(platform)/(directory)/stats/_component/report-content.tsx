"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Line, Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MonthlyStatsData, InstallmentStats } from "@/lib/stats.service";
import { useStatsDetailsModal } from "@/hooks/use-stats-details-modal";
import { QUARTER_LABELS } from "@/lib/quarter-utils";

interface ReportContentProps {
  readonly data: MonthlyStatsData[];
  readonly year: number;
  readonly dateRange?: {
    from: Date;
    to: Date;
  };
  readonly hasDateRange?: boolean;
  readonly hasQuarter?: boolean;
  readonly quarter?: number;
  readonly installmentStats?: InstallmentStats;
}

export default function ReportContent({ data, year, dateRange, hasDateRange, hasQuarter, quarter, installmentStats }: ReportContentProps) {
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

    const months: Array<{ name: string; index: number; dataIndex: number; year: number }> = [];
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
    profit: data[monthInfo.dataIndex]?.profit || 0,
  }));

  const chartConfig = {
    unpaid: { label: " ยังไม่ชำระ", color: "#f97316" },
    paid: { label: " ชำระแล้ว", color: "#15803d" },
    installment: { label: " ผ่อนชำระ", color: "#dc2626" },
    profit: { label: " กำไร(ที่ชำระแล้ว)", color: "#06b6d4" },
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
        profit: acc.profit + (monthData.profit ?? 0),
      };
    },
    { paid: { withVAT: 0, withoutVAT: 0 }, unpaid: { withVAT: 0, withoutVAT: 0 }, installment: { withVAT: 0, withoutVAT: 0 }, purchaseOrder: 0, profit: 0 }
  );

  // Pie chart data - Sales by Status
  const salesByStatusData = [
    { name: "ชำระแล้ว", value: totals.paid.withoutVAT, color: "#15803d" },
    { name: "ยังไม่ชำระ", value: totals.unpaid.withoutVAT, color: "#f97316" },
    { name: "ผ่อนชำระ", value: totals.installment.withoutVAT, color: "#dc2626" },
  ].filter(item => item.value > 0);

  // Pie chart data - Profit vs Cost (from paid sales only)
  // Use Math.round to ensure exact match with table values and header
  const displayPaidTotal = Math.round(totals.paid.withoutVAT);
  const displayProfit = Math.round(totals.profit);
  // Force cost to be the difference so the sum matches the total EXACTLY
  const displayCost = Math.max(0, displayPaidTotal - displayProfit);

  const profitVsCostData = [
    { name: "กำไร", value: displayProfit, color: "#06b6d4" },
    { name: "ต้นทุน", value: displayCost, color: "#94a3b8" },
  ].filter(item => item.value > 0);

  // Pie chart data - Installment Status (Paid vs Pending)
  // Calculate displayed values to ensure consistency (Total = Paid + Pending)
  const rawPaid = installmentStats?.paid.withoutVAT ?? 0;
  const rawPending = installmentStats?.pending.withoutVAT ?? 0;
  const rawTotal = rawPaid + rawPending;

  const displayTotal = Math.round(rawTotal);
  const displayPaid = Math.round(rawPaid);
  // Force pending to be the difference so the sum matches the total exactly
  const displayPending = Math.max(0, displayTotal - displayPaid);

  const installmentStatusData = installmentStats ? [
    { name: "ชำระแล้ว", value: displayPaid, color: "#15803d" },
    { name: "รอชำระ", value: displayPending, color: "#dc2626" },
  ].filter(item => item.value > 0) : [];

  const totalInstallment = displayTotal;

  return (
    <div className="space-y-6">

      {/* Pie Charts Section */}
      < div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
        {/* Sales by Status Pie Chart */}
        < Card >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">สัดส่วนยอดขายตามสถานะ (ไม่รวม VAT)</CardTitle>
          </CardHeader>
          <CardContent>
            {salesByStatusData.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {salesByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {salesByStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card >

        {/* Profit vs Cost Pie Chart */}
        < Card >
          <CardHeader className="pb-2">
            <CardTitle className="text-base "> <span className="text-green-600">ชำระแล้วไม่รวม VAT {formatCurrency(totals.paid.withoutVAT)}</span> (กำไร vs ต้นทุน)</CardTitle>
          </CardHeader>
          <CardContent>
            {profitVsCostData.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={profitVsCostData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {profitVsCostData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {profitVsCostData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card >

        {/* QuotationInstallment: Paid vs Pending Pie Chart  */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base"><span className="text-red-600">ผ่อนชำระไม่รวม VAT {formatCurrency(totalInstallment)}</span> (ชำระแล้ว vs รอชำระ)</CardTitle>
          </CardHeader>
          <CardContent>
            {installmentStatusData.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={installmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {installmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {installmentStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div >
      <Card>
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
                  <th className="text-center py-3 px-2 border-l border-r" colSpan={2}>รวมยอดขาย</th>
                  <th className="text-center py-3 px-2">กำไร(ที่ชำระแล้ว)</th>
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
                  <th className="text-right py-2 px-2 text-xs border-r">ไม่รวม VAT</th>
                  <th className="text-right py-2 px-2 text-xs"></th>
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
                      <td className="py-2 px-2 text-right text-purple-600 font-medium bg-gray-50 border-r">{formatCurrency((monthData?.unpaid.withoutVAT || 0) + (monthData?.paid.withoutVAT || 0) + (monthData?.installment.withoutVAT || 0))}</td>
                      <td className={`py-2 px-2 text-right font-medium ${(monthData?.profit || 0) < 0 ? 'text-red-600' : 'text-cyan-600'}`}>{formatCurrency(monthData?.profit || 0)}</td>
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
                  <td className="py-3 px-2 text-right text-purple-600 font-bold border-r">{formatCurrency(totals.unpaid.withoutVAT + totals.paid.withoutVAT + totals.installment.withoutVAT)}</td>
                  <td className={`py-3 px-2 text-right font-bold ${totals.profit < 0 ? 'text-red-600' : 'text-cyan-600'}`}>{formatCurrency(totals.profit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">เปรียบเทียบยอดขายที่ชำระแล้ว ยังไม่ชำระ และผ่อนชำระ (รวม VAT)</h3>
            </div>
            <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
              <ComposedChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} formatter={(value, name) => [formatCurrency(Number(value)), chartConfig[name as keyof typeof chartConfig]?.label]} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar yAxisId="left" dataKey="unpaid" stackId="a" fill="var(--color-unpaid)" radius={[0, 0, 0, 0]}
                  onClick={(_, index) => {
                    const monthInfo = displayMonths[index];
                    const monthData = data[monthInfo?.dataIndex];
                    if (monthInfo) {
                      statsModal.onOpen({
                        year: monthInfo.year || year,
                        month: monthInfo.index,
                        monthLabel: monthInfo.name,
                        initialTab: "unpaid",
                        profit: monthData?.profit ?? 0,
                      });
                    }
                  }}
                />
                <Bar yAxisId="left" dataKey="paid" stackId="a" fill="var(--color-paid)" radius={[0, 0, 0, 0]}
                  onClick={(_, index) => {
                    const monthInfo = displayMonths[index];
                    const monthData = data[monthInfo?.dataIndex];
                    if (monthInfo) {
                      statsModal.onOpen({
                        year: monthInfo.year || year,
                        month: monthInfo.index,
                        monthLabel: monthInfo.name,
                        initialTab: "paid",
                        profit: monthData?.profit ?? 0,
                      });
                    }
                  }}
                />
                <Bar yAxisId="left" dataKey="installment" stackId="a" fill="var(--color-installment)" radius={[4, 4, 0, 0]}
                  onClick={(_, index) => {
                    const monthInfo = displayMonths[index];
                    const monthData = data[monthInfo?.dataIndex];
                    if (monthInfo) {
                      statsModal.onOpen({
                        year: monthInfo.year || year,
                        month: monthInfo.index,
                        monthLabel: monthInfo.name,
                        initialTab: "installment",
                        profit: monthData?.profit ?? 0,
                      });
                    }
                  }}
                />
                <Line yAxisId="right" type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={3} dot={{ fill: "var(--color-profit)", r: 4 }} />
              </ComposedChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card >

    </div>
  );
}

