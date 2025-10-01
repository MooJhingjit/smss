"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { DateRange, DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import "react-day-picker/style.css";

interface DateRangeSelectorProps {
  readonly currentRange: {
    from: Date;
    to: Date;
  };
}

export default function DateRangeSelector({
  currentRange,
}: DateRangeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: currentRange.from,
    to: currentRange.to,
  });

  // Check if date range mode is active
  const isDateRangeMode = searchParams.get("from") && searchParams.get("to");

  const handleDateChange = (newDate: DateRange | undefined) => {
    console.log("🚀 ~ handleDateChange ~ newDate:", newDate);

    // Update date state
    setDate(newDate);
  };

  const handleConfirm = () => {
    if (date?.from && date?.to) {
      setIsLoading(true);

      const fromDate = format(date.from, "yyyy-MM-dd");
      const toDate = format(date.to, "yyyy-MM-dd");

      // Clear any existing year parameter and set date range
      const url = new URL(window.location.href);
      url.searchParams.delete("year");
      url.searchParams.set("from", fromDate);
      url.searchParams.set("to", toDate);

      // Close popover before reload
      setIsOpen(false);

      // Reload page with new params
      window.location.href = url.toString();
    }
  };

  // Reset loading state when the page has finished loading with the new dates
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && to) {
      // Update date state from URL
      const fromDate = new Date(from);
      const toDate = new Date(to);
      setDate({ from: fromDate, to: toDate });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const formatDateRange = () => {
    if (date?.from) {
      if (date.to) {
        return `${format(date.from, "dd MMM yyyy", { locale: th })} - ${format(
          date.to,
          "dd MMM yyyy",
          { locale: th }
        )}`;
      } else {
        return format(date.from, "dd MMM yyyy", { locale: th });
      }
    }
    return "เลือกช่วงวันที่";
  };

  return (
    <div className="">
      {isLoading ? (
        <div className="flex items-center gap-2 h-10 px-3 py-2 w-full max-w-[300px] border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">กำลังโหลด...</span>
        </div>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full max-w-[300px] justify-start text-left font-normal text-sm sm:text-base ${
                isDateRangeMode ? "ring-2 ring-primary border-primary" : ""
              }`}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="px-2">
              <DayPicker
                mode="range"
                required
                defaultMonth={date?.from}
                numberOfMonths={2}
                selected={date}
                onSelect={handleDateChange}
                disabled={(date: Date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                locale={th}
              />
            </div>
            <div className="p-3 border-t flex items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                {date?.from && date?.to ? (
                  <span>
                    {format(date.from, "dd MMM yyyy", { locale: th })} -{" "}
                    {format(date.to, "dd MMM yyyy", { locale: th })}
                  </span>
                ) : (
                  <span>กรุณาเลือกช่วงวันที่</span>
                )}
              </div>
              <Button
                onClick={handleConfirm}
                disabled={!date?.from || !date?.to}
                size="sm"
              >
                ยืนยัน
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
