"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { QUARTERS } from "@/lib/quarter-utils";

interface QuarterSelectorProps {
    readonly currentYear: number;
    readonly currentQuarter: number;
}

export default function QuarterSelector({
    currentYear,
    currentQuarter,
}: QuarterSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>(
        `${currentYear}-${currentQuarter}`
    );

    // Check if quarter mode is active
    const isQuarterMode = searchParams.get("quarter") !== null;

    // Generate year options from 5 years ago to current year
    const currentFullYear = new Date().getFullYear();
    const yearOptions = Array.from(
        { length: 6 },
        (_, i) => currentFullYear - 5 + i
    );

    // Generate combined year-quarter options
    const options = yearOptions.flatMap((year) =>
        QUARTERS.map((q) => ({
            value: `${year}-${q.value}`,
            label: `${year} - ${q.label}`,
            year,
            quarter: q.value,
        }))
    );

    const handleChange = (value: string) => {
        setIsLoading(true);
        setSelectedValue(value);
        const [year, quarter] = value.split("-");
        router.push(`${pathname}?year=${year}&quarter=${quarter}`);
    };

    // Reset loading state when the page has finished loading
    useEffect(() => {
        const year = searchParams.get("year");
        const quarter = searchParams.get("quarter");
        const urlValue = `${year}-${quarter}`;

        if (urlValue === selectedValue) {
            setIsLoading(false);
        }
    }, [searchParams, selectedValue]);

    return (
        <div className="">
            {isLoading ? (
                <div className="flex items-center gap-2 h-10 px-3 py-2 w-full max-w-[280px] border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">กำลังโหลด...</span>
                </div>
            ) : (
                <Select
                    value={`${currentYear}-${currentQuarter}`}
                    onValueChange={handleChange}
                    disabled={isLoading}
                >
                    <SelectTrigger
                        className={`w-full max-w-[280px] text-sm sm:text-base ${isQuarterMode ? "ring-2 ring-primary border-primary" : ""
                            }`}
                    >
                        <SelectValue placeholder="เลือกไตรมาส" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
