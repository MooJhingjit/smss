"use client";

import { getDateFormat } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// This type is used to define the shape of our data.
export type QuotationWithInstallments = {
    id: number;
    code: string;
    contact: {
        name: string;
    };
    installmentSummary: {
        totalInstallments: number;
        paidInstallments: number;
        overdueInstallments: number;
        totalAmount: number;
        totalAmountWithVat: number;
        paidAmount: number;
        paidAmountWithVat: number;
        remainingAmount: number;
        remainingAmountWithVat: number;
        nextDueDate: string | null;
        paymentProgress: number;
    };
};

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "code",
        header: "เลขใบเสนอราคา",
        sortingFn: "alphanumeric",
        enableSorting: true,
        cell: ({ row }) => {
            const { code, id } = row.original;
            return (
                <Link 
                    href={`/installments/${id}`} 
                    className="text-blue-500 hover:underline"
                >
                    {code}
                </Link>
            );
        },
    },
    {
        accessorKey: "contact.name",
        header: "ลูกค้า",
        sortingFn: "alphanumeric",
        enableSorting: true,
        cell: ({ row }) => {
            const { contact } = row.original;
            return contact?.name || "-";
        },
    },
    {
        accessorKey: "installmentSummary.totalInstallments",
        header: "จำนวนงวด",
        cell: ({ row }) => {
            const { installmentSummary } = row.original;
            const { totalInstallments, paidInstallments } = installmentSummary;
            return (
                <div className="text-center">
                    <span className="font-medium">{paidInstallments}/{totalInstallments}</span>
                    <div className="text-xs text-gray-500">งวด</div>
                </div>
            );
        },
    },
    {
        accessorKey: "installmentSummary.paymentProgress",
        header: "ความคืบหน้า",
        cell: ({ row }) => {
            const { installmentSummary } = row.original;
            const { paymentProgress, overdueInstallments } = installmentSummary;
            const variant = overdueInstallments > 0 ? "destructive" : 
                          paymentProgress === 100 ? "default" : "secondary";
            
            return (
                <div className="flex items-center space-x-2">
                    <Badge variant={variant}>
                        {paymentProgress}%
                    </Badge>
                    {overdueInstallments > 0 && (
                        <Badge variant="destructive" className="text-xs">
                            เกิน {overdueInstallments} งวด
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "installmentSummary.remainingAmount",
        header: "คงเหลือ (ไม่รวม VAT)",
        cell: ({ row }) => {
            const { installmentSummary } = row.original;
            const { remainingAmount } = installmentSummary;
            return remainingAmount.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
            });
        },
    },
    {
        accessorKey: "installmentSummary.remainingAmountWithVat",
        header: "คงเหลือ (รวม VAT)",
        cell: ({ row }) => {
            const { installmentSummary } = row.original;
            const { remainingAmountWithVat } = installmentSummary;
            return remainingAmountWithVat.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
            });
        },
    },
    {
        accessorKey: "installmentSummary.totalAmountWithVat",
        header: "ยอดรวมทั้งสิ้น",
        cell: ({ row }) => {
            const { installmentSummary } = row.original;
            const { totalAmountWithVat } = installmentSummary;
            return totalAmountWithVat.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
            });
        },
    },
    {
        accessorKey: "installmentSummary.nextDueDate",
        header: "งวดครบกำหนดถัดไป",
        sortingFn: "datetime",
        enableSorting: true,
        cell: ({ row }) => {
            const { installmentSummary } = row.original;
            const { nextDueDate } = installmentSummary;
            return nextDueDate || (
                <Badge variant="default" className="text-xs">
                    ชำระครบแล้ว
                </Badge>
            );
        },
    },
];
