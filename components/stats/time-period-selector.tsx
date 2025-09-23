"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { YearSelector, DateRangeSelector } from "@/components/stats";

interface TimePeriodSelectorProps {
  readonly year: number;
  readonly dateRange: {
    from: Date;
    to: Date;
  };
  readonly hasDateRange: boolean;
}

export default function TimePeriodSelector({
  year,
  dateRange,
  hasDateRange,
}: TimePeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine current mode based on URL parameters
  const currentMode = hasDateRange ? "dateRange" : "year";

  const handleModeChange = (value: string) => {
    if (value === "year" && hasDateRange) {
      // Switch to year mode - clear date range params
      router.push(`${pathname}?year=${year}`);
    } else if (value === "dateRange" && !hasDateRange) {
      // Switch to date range mode - set current year as date range
      const fromDate = `${year}-01-01`;
      const toDate = `${year}-12-31`;
      router.push(`${pathname}?from=${fromDate}&to=${toDate}`);
    }
  };

  return (
    <div className="w-full ">
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-6">
          {/* Radio Group Header */}
          {/* <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              เลือกช่วงเวลาที่ต้องการแสดงสถิติ
            </h3>
          </div> */}

          {/* Radio Group */}
          <RadioGroup
            value={currentMode}
            onValueChange={handleModeChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 "
          >
            {/* Year Selection Option */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="year" id="year-option" />
                <Label 
                  htmlFor="year-option" 
                  className="text-base font-medium cursor-pointer"
                >
                  เลือกตามปี
                </Label>
              </div>
              <div className={`pl-6 transition-opacity ${
                currentMode === "year" ? "opacity-100" : "opacity-50"
              }`}>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    แสดงสถิติทั้งปี {year}
                  </p>
                  <YearSelector currentYear={year} />
                </div>
              </div>
            </div>

            {/* Date Range Selection Option */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dateRange" id="dateRange-option" />
                <Label 
                  htmlFor="dateRange-option" 
                  className="text-base font-medium cursor-pointer"
                >
                  เลือกช่วงวันที่
                </Label>
              </div>
              <div className={`pl-6 transition-opacity ${
                currentMode === "dateRange" ? "opacity-100" : "opacity-50"
              }`}>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    เลือกช่วงเวลาที่ต้องการแสดงสถิติ
                  </p>
                  <DateRangeSelector currentRange={dateRange} />
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
