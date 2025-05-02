"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { NewStats } from "./stat-chart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StatChart({ data }: { data: any }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(data);

  // Track year changes to trigger loading state
  const year = searchParams.get("year");

  // Effect to handle loading state when year changes
  useEffect(() => {
    // Start loading
    setIsLoading(true);

    // Set chart data with the new data
    setChartData(data);

    // Simulate a small delay to prevent flickering on very fast loads
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [data, year]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="">
      <Line data={chartData} />;
    </div>
  )
}
