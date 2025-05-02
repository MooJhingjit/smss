"use client";

import React from "react";
import CardWrapper from "../../../../features/home/components/card-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <CardWrapper title="ยอดขาย และยอดสั่งซื้อประจำปี">
        <Skeleton className="w-full h-[400px]" />
      </CardWrapper>
    </div>
  );
}
