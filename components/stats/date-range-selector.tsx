"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { th } from "date-fns/locale";

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
    
    // If user clicks on a date when there's already a range selected, reset to new start date
    if (date?.from && date?.to && newDate?.from && newDate?.to) {
      setDate({ from: newDate.to, to: undefined });
      return;
    }

    if (date && newDate?.from && newDate?.to) {
      setIsLoading(true);
      setDate({
        from: date.from,
        to: newDate.to,
      });

      const fromDate = format(newDate.from, "yyyy-MM-dd");
      const toDate = format(newDate.to, "yyyy-MM-dd");

      // Clear any existing year parameter and set date range
      router.push(`${pathname}?from=${fromDate}&to=${toDate}`);
      
      // Close popover only when both dates are selected
      setIsOpen(false);
    } else {
      // Update the date state but keep popover open
      setDate(newDate);
    }
  };

  // Reset loading state when the page has finished loading with the new dates
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && to) {
      const currentFrom = format(currentRange.from, "yyyy-MM-dd");
      const currentTo = format(currentRange.to, "yyyy-MM-dd");

      if (from === currentFrom && to === currentTo) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [searchParams, currentRange]);

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
              className={`w-full max-w-[300px] justify-start text-left font-normal text-sm sm:text-base ${isDateRangeMode ? 'ring-2 ring-primary border-primary' : ''}`}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              numberOfMonths={2}
              selected={date}
              onSelect={handleDateChange}
              disabled={(date: Date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              required
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
