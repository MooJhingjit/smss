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

interface YearSelectorProps {
  readonly currentYear: number;
}

export default function YearSelector({ currentYear }: YearSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  // Check if year mode is active (no date range parameters and no quarter)
  const isYearMode = !searchParams.get("from") && !searchParams.get("to") && !searchParams.get("quarter");

  // Generate year options from 2025 to current year
  const currentFullYear = new Date().getFullYear();
  const startYear = 2025;
  const yearOptions = Array.from({ length: Math.max(1, currentFullYear - startYear + 1) }, (_, i) => startYear + i);

  const handleYearChange = (newYear: string) => {
    setIsLoading(true);
    setSelectedYear(newYear);
    // Clear any existing date range parameters and set year
    router.push(`${pathname}?year=${newYear}`);
  };

  // Reset loading state when the page has finished loading with the new year
  useEffect(() => {
    const year = searchParams.get("year") ?? new Date().getFullYear().toString();

    if (year === selectedYear) {
      setIsLoading(false);
    }
  }, [searchParams, selectedYear]);

  return (
    <div className="">
      {/* <span className="text-sm font-medium">เลือกปี:</span> */}
      {isLoading ? (
        <div className="flex items-center gap-2 h-10 px-3 py-2 w-full max-w-[200px] border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">กำลังโหลด...</span>
        </div>
      ) : (
        <Select
          value={isYearMode ? currentYear.toString() : ""}
          onValueChange={handleYearChange}
          disabled={isLoading}
        >
          <SelectTrigger className={`w-full max-w-[200px] text-sm sm:text-base ${isYearMode ? 'ring-2 ring-primary border-primary' : ''}`}>
            <SelectValue placeholder={currentYear.toString()} />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
