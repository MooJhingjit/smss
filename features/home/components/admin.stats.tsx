"use client";
import React from "react";
import {
  KanbanSquare,
  Receipt,
  Box,
  Users,
  PackageOpen,
  ExternalLink,
  FileClock,
} from "lucide-react";
import Link from "next/link";
import { getDateFormat, getPriceFormat } from "@/lib/utils";
// import { create } from '@/actions/create-user'
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  saleTotal: number;
  orderAmount: number;
  saleTotalWithVat: number;
};

const AdminStats = ({ saleTotal, orderAmount, saleTotalWithVat }: Props) => {
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const lastDay = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  );

  return (
    <div className="col-span-4 md:col-span-5 xl:col-span-3 p-2  relative  border rounded-lg shadow-lg overflow-hidden">
      {/* <div className="absolute inset-0 bg-gray-100  rounded-lg opacity-10 z-10 h-full"></div> */}
      {/* <div className="">
        <p className=" text-sm">สรุปข้อมูลในช่วง</p>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <Badge variant="secondary">{getDateFormat(firstDay)}</Badge>
          {" - "}
          <Badge variant="secondary">{getDateFormat(lastDay)}</Badge>
        </div>
      </div> */}

      <div className="flex items-center  space-x-2 ">
        <p className=" ">สรุปข้อมูลทั้งเดือน</p>

        <Badge variant="secondary" className="text-md">{getDateFormat(firstDay)}</Badge>
        {" - "}
        <Badge variant="secondary" className="text-md">{getDateFormat(lastDay)}</Badge>
      </div>

      <div className="flex  w-full  justify-between    flex-1 mt-4 ">
        <div className=" lg:border-gray-900/5 lg:border-t-0 lg:mb-0 z-20 flex-1">
          <dt className="text font-medium leading-6 flex space-x-1 text-slate-700 ">
            {/* <CircleDollarSign className='w-5 h-5' strokeWidth={1.5} /> */}
            <p className=" underline">ยอดขาย</p>
          </dt>
          <dd className="mt-1 w-full flex-none font-medium  text-slate-800 ">
            {getPriceFormat(saleTotal)}
          </dd>
          <dd className="mt-1 w-full flex-none font-medium  text-slate-800 ">
            {getPriceFormat(saleTotalWithVat) + " (+VAT)"}
          </dd>
        </div>

        <div className="justify-center border-gray-900/5 lg:border-t-0 flex-1 ">
          <dt className="text font-medium leading-6  flex space-x-1 text-slate-800">
            {/* <CircleDollarSign className='w-5 h-5 ' strokeWidth={1.5} /> */}
            <p className=" underline">ยอดสั่งซื้อ</p>
          </dt>
          <dd className="mt-1 w-full flex-none font-medium text-slate-800 ">
            {getPriceFormat(orderAmount)}
          </dd>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
