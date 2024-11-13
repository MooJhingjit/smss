"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

type DataInfoProps = {
    header: string;
    lists: { label: string; value: string | ReactNode }[];
    onEdit: () => void;
    className?: string; // optional prop for additional custom styles
};

export default function DataInfo({
    header,
    lists,
    onEdit,
    className = "",
}: Readonly<DataInfoProps>) {
    return (
        <div className={cn(
            `rounded-md p-4 border`,
            className
        )}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-yellow-800">{header}</h3>
                <button
                    onClick={onEdit}
                    className="inline-flex cursor-pointer items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                >
                    Edit
                </button>
            </div>
            <div className="mt-2 text-sm text-yellow-700 grid grid-cols-1  sm:grid-cols-3 md:grid-cols-4 gap-2">
                {lists.map((item, index) => (
                    <Item key={index} label={item.label} value={item.value} />
                ))}
            </div>
        </div>
    );
}

const Item = ({ label, value }: { label: string; value: string | ReactNode }) => (
    <div className="bg-gray-50 p-2">
        <p className="text-gray-500 text-xs">{label}</p>
        <div className="">{typeof value === "string" ? <p className="text-gray-500">{value}</p> : <>{value}</>}</div>
    </div>
);
