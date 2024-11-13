"use client";
import React from "react";
import {
    QuotationStatus,
} from "@prisma/client";
import { quotationStatusMapping } from "@/app/config";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ConfirmActionButton from "@/components/confirm-action";
import StatusBadge from "@/components/badges/status-badge";

export default function QuotationStatusDropdown({
    curStatus,
    onStatusChange,
}: {
    curStatus: QuotationStatus;
    onStatusChange: (status: QuotationStatus) => void;
}) {
    const allStatus = Object.keys(QuotationStatus) as QuotationStatus[];

    if (curStatus === QuotationStatus.pending_approval) {
        return (
            <div className="flex space-x-3">
                <StatusBadge status={quotationStatusMapping[curStatus].label} />

                <ConfirmActionButton
                    onConfirm={() => {
                        onStatusChange(QuotationStatus.offer);
                    }}
                >
                    <Button
                        variant="default"
                        color="green"
                        className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
                    >
                        <span>อนุมัติ</span>
                    </Button>
                </ConfirmActionButton>
                <ConfirmActionButton
                    onConfirm={() => {
                        onStatusChange(QuotationStatus.open);
                    }}
                >
                    <Button
                        variant="destructive"
                        className="inline-flex items-center px-2 py-1 rounded-md  text-xs h-full"
                    >
                        <span>ยกเลิก</span>
                    </Button>
                </ConfirmActionButton>
            </div>
        );
    }

    return (
        <Select onValueChange={onStatusChange}>
            <SelectTrigger className="inline-flex capitalize font-semibold  rounded-md bg-yellow-50 px-2 py-1 text-xs text-yellow-700 border border-yellow-500 items-center">
                <SelectValue placeholder={quotationStatusMapping[curStatus].label} />
            </SelectTrigger>
            <SelectContent className="bg-white text-xs p-2 space-y-2 ">
                {allStatus.map((status, index) => (
                    <SelectItem
                        value={status}
                        key={index}
                        className={
                            status === curStatus
                                ? "bg-yellow-100 text-yellow-700"
                                : "text-gray-700"
                        }
                    >
                        {quotationStatusMapping[status].label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
