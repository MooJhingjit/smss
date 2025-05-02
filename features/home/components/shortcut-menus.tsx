"use client";
import React from "react";
import { KanbanSquare, Receipt, Box, Users, PackageOpen, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getDateFormat, getPriceFormat } from "@/lib/utils";
// import { create } from '@/actions/create-user'
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type StatProps = {
  saleTotal: number;
  orderAmount: number;
  saleTotalWithVat: number;
};
type Props = StatProps;

export default function ShortcutMenus({
  saleTotal,
  orderAmount,
  saleTotalWithVat,
}: Props) {
  return (
    <div className="grid  grid-cols-4 lg:grid-cols-5 gap-4">
      <MenuItem
        icon={
          <KanbanSquare
            className="w-6 h-6 lg:w-12 lg:h-12  "
            strokeWidth={1.5}
          />
        }
        label="ใบเสนอราคา"
        link="/quotations"
      />
      <MenuItem
        icon={
          <Receipt className="w-6 h-6 lg:w-12 lg:h-12  " strokeWidth={1.5} />
        }
        label="ใบสั่งซื้อ"
        link="/purchase-orders"
      />
      <MenuItem
        icon={<Box className="w-6 h-6 lg:w-12 lg:h-12  " strokeWidth={1.5} />}
        label="กลุ่มสินค้า"
        link="/products"
      />
      <MenuItem
        icon={
          <PackageOpen
            className="w-6 h-6 lg:w-12 lg:h-12  "
            strokeWidth={1.5}
          />
        }
        label="คลังสินค้า"
        link="/items"
      />
      <MenuItem
        icon={<Users className="w-6 h-6 lg:w-12 lg:h-12  " strokeWidth={1.5} />}
        label="ผู้ใช้งาน"
        link="/users"
      />
      <MenuItem
        icon={<Users className="w-6 h-6 lg:w-12 lg:h-12  " strokeWidth={1.5} />}
        label="ลูกค้า"
        link="/contacts"
      />

      <MenuItem
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chart-column-increasing-icon lucide-chart-column-increasing"><path d="M13 17V9" /><path d="M18 17V5" /><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M8 17v-3" /></svg>}
        label="สรุปรายปี"
        link="/stats"
        isNewTab
      />
      <Stats
        saleTotal={saleTotal}
        saleTotalWithVat={saleTotalWithVat}
        orderAmount={orderAmount}
      />
    </div>
  );
}

const MenuItem = (props: {
  link: string;
  icon: React.ReactNode;
  label: string;
  isNewTab?: boolean;
}) => {
  const { link, icon, label, isNewTab } = props;
  return (
    <Link
      href={link}
      className="col-span-1 flex flex-col items-center justify-center relative rounded-lg p-2 lg:py-4 px-2 group cursor-pointer shadow-lg hover:shadow-sm "
      target={isNewTab ? "_blank" : "_self"}
    >
      <div className="absolute inset-0 bg-gray-700  rounded-lg opacity-10 z-10 h-full"></div>

      <div className="flex items-center justify-center group-hover:text-primary">
        {icon}
      </div>
      <div className="mt-2 text-xs   hidden lg:block group-hover:text-primary">
        {label}
      </div>
    </Link>
  );
};

const Stats = ({ saleTotal, orderAmount, saleTotalWithVat }: StatProps) => {
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const lastDay = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  );

  return (
    <div className="col-span-3 lg:p-2  relative  border rounded-lg shadow-lg overflow-hidden">
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
        <p className=" text-sm">สรุปข้อมูลเดือนนี้</p>

        <Badge variant="secondary">{getDateFormat(firstDay)}</Badge>
        {" - "}
        <Badge variant="secondary">{getDateFormat(lastDay)}</Badge>
      </div>

      <div className="flex  w-full  justify-between    flex-1 ">
        <div className=" lg:border-gray-900/5 lg:border-t-0 lg:mb-0 z-20 flex-1">
          <dt className="text font-medium leading-6 flex space-x-1 text-slate-700 ">
            {/* <CircleDollarSign className='w-5 h-5' strokeWidth={1.5} /> */}
            <p className="text-xs underline">ยอดขาย</p>
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
            <p className="text-xs underline">ยอดสั่งซื้อ</p>
          </dt>
          <dd className="mt-1 w-full flex-none font-medium text-slate-800 ">
            {getPriceFormat(orderAmount)}
          </dd>
        </div>
      </div>
    </div>
  );
};
