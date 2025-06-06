import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface MonthlyStatisticsProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  year: number;
}

export default function MonthlyStatistics({ data, year }: MonthlyStatisticsProps) {
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Extract data from datasets
  const salesWithVAT = data.datasets.find(d => d.label === 'ยอดขายรวม VAT')?.data || [];
  const salesWithoutVAT = data.datasets.find(d => d.label === 'ยอดขายไม่รวม VAT')?.data || [];
  const purchase = data.datasets.find(d => d.label === 'ยอดสั่งซื้อ')?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>สถิติรายเดือน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">เดือน</th>
              <th className="text-right py-2 px-2">ยอดขายรวม VAT</th>
              <th className="text-right py-2 px-2">ยอดขายไม่รวม VAT</th>
              <th className="text-right py-2 px-2">ยอดสั่งซื้อ</th>
            </tr>
          </thead>
          <tbody>
            {monthNames.map((month, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{month}</td>
                <td className="py-2 px-2 text-right text-green-600">
                  {formatCurrency(salesWithVAT[index] || 0)}
                </td>
                <td className="py-2 px-2 text-right text-blue-600">
                  {formatCurrency(salesWithoutVAT[index] || 0)}
                </td>
                <td className="py-2 px-2 text-right text-orange-600">
                  {formatCurrency(purchase[index] || 0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-semibold bg-gray-50">
              <td className="py-2 px-2">รวม</td>
              <td className="py-2 px-2 text-right text-green-600">
                {formatCurrency(salesWithVAT.reduce((sum, val) => sum + val, 0))}
              </td>
              <td className="py-2 px-2 text-right text-blue-600">
                {formatCurrency(salesWithoutVAT.reduce((sum, val) => sum + val, 0))}
              </td>
              <td className="py-2 px-2 text-right text-orange-600">
                {formatCurrency(purchase.reduce((sum, val) => sum + val, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </CardContent>
    </Card>
  )
}
