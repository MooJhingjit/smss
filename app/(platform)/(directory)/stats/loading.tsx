"use client";

import React from "react";
import CardWrapper from "../../../../features/home/components/card-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="">
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-1">
          <Skeleton className="w-full h-[200px]" />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-[200px]" />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-[200px]" />
        </div>

        <div className="col-span-3 space-y-5">
          <Skeleton className="w-full h-[600px]" />
        </div>
      </div>
      {/* <div className="flex justify-end mb-4">
        <Skeleton className="h-10 w-[150px]" />
      </div> */}
      {/* <CardWrapper title="ยอดขาย และยอดสั่งซื้อประจำปี">
        <Skeleton className="w-full h-[400px]" />
      </CardWrapper> */}
    </div>
  );
}
