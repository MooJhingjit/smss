"use client";

import React, { useState } from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

// Mock data based on the screenshot
const mockQuotationData = {
  code: "QT2025000013-R2",
  customerName: "พรวิมล Quotation โจทย์การ์",
  validUntil: "30 วัน",
  creditTerm: "60 วัน",
  total: 2172100.0,
  subtotal: 2030000.0,
  discount: 0.0,
  vat: 142100.0,
  status: "approved",
};

interface InstallmentRow {
  id: number;
  period: string;
  amount: number;
  amountWithVat: number;
  dueDate: string;
  isPaid: boolean;
}

export default function InstallmentDetailPage() {
const [installments, setInstallments] = useState<InstallmentRow[]>([
    {
        id: 1,
        period: "1/12",
        amount: 181008.33,
        amountWithVat: 194849.50, // amount + 7% VAT
        dueDate: "31/01/2025",
        isPaid: true,
    },
    {
        id: 2,
        period: "2/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "28/02/2025",
        isPaid: true,
    },
    {
        id: 3,
        period: "3/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "31/03/2025",
        isPaid: false,
    },
    {
        id: 4,
        period: "4/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "30/04/2025",
        isPaid: false,
    },
    {
        id: 5,
        period: "5/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "31/05/2025",
        isPaid: false,
    },
    {
        id: 6,
        period: "6/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "30/06/2025",
        isPaid: false,
    },
    {
        id: 7,
        period: "7/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "31/07/2025",
        isPaid: false,
    },
    {
        id: 8,
        period: "8/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "31/08/2025",
        isPaid: false,
    },
    {
        id: 9,
        period: "9/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "30/09/2025",
        isPaid: false,
    },
    {
        id: 10,
        period: "10/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "31/10/2025",
        isPaid: false,
    },
    {
        id: 11,
        period: "11/12",
        amount: 181008.33,
        amountWithVat: 194849.50,
        dueDate: "30/11/2025",
        isPaid: false,
    },
    {
        id: 12,
        period: "12/12",
        amount: 181008.37,
        amountWithVat: 194849.54, // slightly higher for the last installment to balance
        dueDate: "31/12/2025",
        isPaid: false,
    },
]);

  const pages = [
    {
      name: "ใบเสนอราคาทั้งหมด (QT)",
      href: "/quotations",
      current: false,
    },
    {
      name: mockQuotationData.code,
      href: `/quotations/${mockQuotationData.code}`,
      current: false,
    },
    {
      name: "ผ่อนชำระ",
      href: "",
      current: true,
    },
  ];

  const handleAmountChange = (id: number, newAmount: string) => {
    const amount = parseFloat(newAmount) || 0;
    setInstallments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount } : item))
    );
  };

  const handlePaidChange = (id: number, isPaid: boolean) => {
    setInstallments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPaid } : item))
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalInstallmentAmount = installments.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const paidAmount = installments
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + item.amount, 0);
  const remainingAmount = totalInstallmentAmount - paidAmount;
  const paymentPercentage =
    totalInstallmentAmount > 0
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
    <div className="space-y-6 ">
      <Breadcrumbs pages={pages} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quotation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>รายละเอียดใบเสนอราคา</span>
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                {mockQuotationData.code}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
              <div>
                <p className="text-sm text-gray-600">ลูกค้า</p>
                <p className="font-medium">{mockQuotationData.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ระยะเวลาการชำระเงิน</p>
                <p className="font-medium">{mockQuotationData.creditTerm}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">รวมก่อน VAT</p>
                <p className="font-medium">
                  {formatCurrency(mockQuotationData.subtotal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ยอดรวมทั้งสิ้น</p>
                <p className="font-medium text-lg text-blue-600">
                  {formatCurrency(mockQuotationData.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installment Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
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

              <div className=" space-y-3">
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

        {/* Installment Lists */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>แผนการผ่อนชำระ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">
                      งวดที่
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      จำนวนเงิน (บาท)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      วันครบกำหนด
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">
                      สถานะการชำระ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((installment) => (
                    <TableRow
                      key={installment.id}
                      className={installment.isPaid ? "bg-green-50" : ""}
                    >
                      <TableCell className="font-medium text-gray-700 text-center">
                        <Badge variant="outline">{installment.period}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={installment.amount}
                          onChange={(e) =>
                            handleAmountChange(installment.id, e.target.value)
                          }
                          className="w-[150px] text-right"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-gray-600 ">
                          {installment.dueDate}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Checkbox
                            checked={installment.isPaid}
                            onCheckedChange={(checked) =>
                              handlePaidChange(installment.id, !!checked)
                            }
                          />
                          <span
                            className={`text-sm ${
                              installment.isPaid
                                ? "text-green-600 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {installment.isPaid ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline">บันทึกแผนการผ่อน</Button>
              <Button>อัพเดทสถานะการชำระ</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
