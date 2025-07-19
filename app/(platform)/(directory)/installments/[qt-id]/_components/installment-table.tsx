"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { QuotationInstallment } from "@prisma/client";
import { ReceiptPrint } from "@/components/print-receipt";

interface InstallmentTableProps {
  installments: QuotationInstallment[];
  quotationId: number;
}

export default function InstallmentTable({ installments: initialInstallments, quotationId }: InstallmentTableProps) {
  const [installments, setInstallments] = useState(initialInstallments);

  const handleAmountChange = (id: number, newAmount: string) => {
    const amount = parseFloat(newAmount) || 0;
    const updatedInstallments = installments.map((item) =>
      item.id === id ? { ...item, amount } : item
    );
    
    setInstallments(updatedInstallments);
  };

  const handlePaidChange = (id: number, isPaid: boolean) => {
    const updatedInstallments = installments.map((item) =>
      item.id === id 
        ? { 
            ...item, 
            status: isPaid ? ("paid" as const) : ("pending" as const),
            paidDate: isPaid ? new Date() : null 
          } 
        : item
    );
    
    setInstallments(updatedInstallments);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };

  const handleUpdatePaymentStatus = async () => {
    // TODO: Implement update payment status with server action
    console.log("Update payment status:", installments);
  };

  return (
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
                  วันครบกำหนด / พิมพ์ใบวางบิล
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">
                  สถานะการชำระ
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {installments.map((installment) => (
                <TableRow
                  key={installment.id}
                  className={installment.status === "paid" ? "bg-green-50" : "border-b"}
                >
                  <TableCell className="font-medium text-gray-700 text-center">
                    <Badge variant="outline">{installment.period}</Badge>
                  </TableCell>                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={installment.amountWithVat}
                          onChange={(e) =>
                            handleAmountChange(installment.id, e.target.value)
                          }
                          className="w-[150px] text-right"
                          step="0.01"
                        />
                      </TableCell>
                  <TableCell className="text-center flex items-center justify-center py-1">
                    <div className="">
                      <ReceiptPrint
                        defaultBillDate={new Date(installment.dueDate)}
                        endpoint={`/`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Checkbox
                        checked={installment.status === "paid"}
                        onCheckedChange={(checked) =>
                          handlePaidChange(installment.id, !!checked)
                        }
                      />
                      <span
                        className={`text-sm ${
                          installment.status === "paid"
                            ? "text-green-600 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {installment.status === "paid" ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          
          <Button onClick={handleUpdatePaymentStatus}>
            อัพเดทสถานะการชำระ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
