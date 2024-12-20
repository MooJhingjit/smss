"use client";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { ReactNode } from "react";
import { Button } from "./ui/button";


const variants = cva(
    "rounded-md p-4",
    {
        variants: {
            variant: {
                yellow: "bg-yellow-50  border border-yellow-400 text-yellow-800",
                gray: "bg-gray-50  border border-gray-300 text-gray-800",
                blue: "bg-blue-50  border border-blue-400 text-blue-800",
            },
        },
        defaultVariants: {
            variant: "gray",
        },
    },
);


type DataInfoProps = VariantProps<typeof variants> & {
    header?: string;
    lists: { label: string; value: string | ReactNode }[];
    onEdit: () => void;
    className?: string; // optional prop for additional custom styles
    columnClassName?: string; // optional prop for additional custom styles
    CustomComponent?: ReactNode;
};

export default function DataInfo({
    header,
    lists,
    onEdit,
    className = "",
    columnClassName = "grid-cols-1  sm:grid-cols-3 md:grid-cols-4",
    variant,
    CustomComponent,
}: Readonly<DataInfoProps>) {
    return (
        <div className={cn(variants({ variant }), className)}>
            <div className="flex items-center justify-between">
                <div className="items-center space-x-3 flex">
                    {
                        header && (
                            <h3 className="font-medium ">{header}</h3>
                        )
                    }
                    {
                        CustomComponent && CustomComponent
                    }
                </div>
                <Button
                    onClick={onEdit}
                    variant={"link"}
                >
                    จัดการ
                </Button>
            </div>
            <div className={
                cn(
                    "mt-2 text-sm  grid  gap-2",
                    columnClassName
                )
            }>
                {lists.map((item, index) => (
                    <Item key={index} label={item.label} value={item.value} />
                ))}
            </div>
        </div>
    );
}

const Item = ({ label, value }: { label: string; value: string | ReactNode }) => (
    <div className="bg-white border p-2 overflow-hidden">
        <p className="text-gray-500 text-xs">{label}</p>
        <div className="">{typeof value === "string" ? <p className="text-sm whitespace-nowrap truncate font-semibold" title={value}>{value}</p> : <>{value}</>}</div>
    </div>
);
