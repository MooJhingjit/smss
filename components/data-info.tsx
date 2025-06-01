"use client";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { ReactNode, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";


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
    collapsible?: boolean; // optional prop to enable/disable collapsible feature
};

export default function DataInfo({
    header,
    lists,
    onEdit,
    className = "",
    columnClassName = "grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4",
    variant,
    CustomComponent,
    collapsible = true,
}: Readonly<DataInfoProps>) {
    const isMobile = useIsMobile();
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Storage key for localStorage
    const storageKey = `data-info-collapsed-${header || 'default'}`;

    // Initialize state from localStorage or mobile detection
    useEffect(() => {
        const savedState = localStorage.getItem(storageKey);
        if (savedState !== null) {
            setIsCollapsed(JSON.parse(savedState));
        } else {
            setIsCollapsed(isMobile);
        }
    }, [isMobile, storageKey]);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem(storageKey, JSON.stringify(newState));
    };

    return (
        <div className={cn(variants({ variant }), className)}>
            <div className="flex items-center justify-between">
                <div className="items-center space-x-3 flex">
                    {collapsible && (
                        <Button
                            onClick={toggleCollapse}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "p-1 h-auto hover:bg-transparent",
                                variant === "yellow" && "text-yellow-800 hover:text-yellow-900",
                                variant === "gray" && "text-gray-800 hover:text-gray-900",
                                variant === "blue" && "text-blue-800 hover:text-blue-900"
                            )}
                        >
                            {isCollapsed ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronUp className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                    {
                        header && (
                            <h3 className="font-medium line-clamp-1">{header}</h3>
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
                    "mt-2 text-sm  transition-all duration-300 ease-in-out",
                    columnClassName,
                    isCollapsed && collapsible ? "hidden" : "block"
                )
            }>
                <div className={
                    cn(
                        "mt-2 text-sm  grid  gap-2",
                        columnClassName
                    )}>

                    {lists.map((item, index) => (
                        <Item key={index} label={item.label} value={item.value} />
                    ))}
                </div>
        </div>
        </div >
    );
}

const Item = ({ label, value }: { label: string; value: string | ReactNode }) => (
    <div className="bg-white border p-2 overflow-hidden">
        <p className="text-gray-500 text-xs">{label}</p>
        <div className="">{typeof value === "string" ? <p className="text-sm whitespace-nowrap truncate font-semibold" title={value}>{value}</p> : <>{value}</>}</div>
    </div>
);
