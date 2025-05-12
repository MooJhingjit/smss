"use client";

import { getDateFormat } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// This type is used to define the shape of our data.
export type Invoice = {
    id: number;
    code: string;
    date: Date;
    receiptCode: string | null;
    receiptDate: Date | null;
    quotationId: number;
    grandTotal: number;
};

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "billGroup.code",
        header: "เลขกลุ่มบิล",
        sortingFn: "alphanumeric",
        enableSorting: true,
    },
    {
        accessorKey: "code",
        header: "เลขใบแจ้งหนี้",
        sortingFn: "alphanumeric",
        enableSorting: true,
    },
    {
        accessorKey: "date",
        header: "วันที่ออกใบแจ้งหนี้",
        sortingFn: "datetime",
        enableSorting: true,
        // cell: ({ row }) => {
        //     const { date } = row.original;
        //     return getDateFormat(date);
        // },
    },
    {
        accessorKey: "receiptCode",
        header: "เลขใบเสร็จ",
        sortingFn: "alphanumeric",
        enableSorting: true,
        cell: ({ row }) => {
            const { receiptCode } = row.original;
            return receiptCode || "";
        },
    },
    {
        accessorKey: "receiptDate",
        header: "วันที่ออกใบเสร็จ",
        sortingFn: "datetime",
        enableSorting: true,
        // cell: ({ row }) => {
        //     const { receiptDate } = row.original;
        //     return receiptDate ? getDateFormat(receiptDate) : "-";
        // },
    },
    {
        accessorKey: "quotation.code",
        header: "อ้างอิงใบเสนอราคา",
        cell: ({ row }) => {
            const { quotation } = row.original;
            return quotation ? (
                <Link href={`/quotations/${quotation.id}`} target="_blank" className="text-blue-500 hover:underline">
                    {quotation.code}
                </Link>
            ) : "-";
        },
    },
    {
        accessorKey: "grandTotal",
        header: "ยอดรวม",
        cell: ({ row }) => {
            const { grandTotal } = row.original;
            return grandTotal?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
            }) ?? 0;
        },
    },
];
