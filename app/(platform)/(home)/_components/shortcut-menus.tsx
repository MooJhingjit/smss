"use client";
import React from "react";
import { KanbanSquare, Receipt, Box, Users, PackageOpen } from "lucide-react";
import Link from "next/link";
import { getDateFormat, getPriceFormat } from "@/lib/utils";
// import { create } from '@/actions/create-user'

type StatProps = {
  saleTotal: number;
  orderAmount: number;
}
type Props = StatProps

export default function ShortcutMenus({
  saleTotal,
  orderAmount
}: Props) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <MenuItem
        icon={
          <KanbanSquare
            className="w-6 h-6 lg:w-12 lg:h-12  text-white"
            strokeWidth={1.5}
          />
        }
        label="ใบเสนอราคา"
        link="/quotations"
      />
      <MenuItem
        icon={
          <Receipt
            className="w-6 h-6 lg:w-12 lg:h-12  text-white"
            strokeWidth={1.5}
          />
        }
        label="ใบสั่งซื้อ"
        link="/purchase-orders"
      />
      <MenuItem
        icon={
          <Box
            className="w-6 h-6 lg:w-12 lg:h-12  text-white"
            strokeWidth={1.5}
          />
        }
        label="กลุ่มสินค้า"
        link="/products"
      />
      <MenuItem
        icon={
          <PackageOpen
            className="w-6 h-6 lg:w-12 lg:h-12  text-white"
            strokeWidth={1.5}
          />
        }
        label="คลังสินค้า"
        link="/items"
      />
      <MenuItem
        icon={
          <Users
            className="w-6 h-6 lg:w-12 lg:h-12  text-white"
            strokeWidth={1.5}
          />
        }
        label="ผู้ใช้งาน"
        link="/users"
      />
      <MenuItem
        icon={
          <Users
            className="w-6 h-6 lg:w-12 lg:h-12  text-white"
            strokeWidth={1.5}
          />
        }
        label="ลูกค้า"
        link="/contacts"
      />
      {/* <div className="py-10">
        <form action={create} className="pb-4 space-y-2">
          <input
            type="text"
            name="name"
            className="bg-transparent border-b-2 border-gray-700 w-full text-lg text-gray-100 focus:outline-none focus:border-gray-500"
          />
          <input
            type="text"
            name="email"
            className="bg-transparent border-b-2 border-gray-700 w-full text-lg text-gray-100 focus:outline-none focus:border-gray-500"
          />
        <button type="submit">submit</button>

        </form>
      </div> */}
      <Stats
        saleTotal={saleTotal}
        orderAmount={orderAmount}
      />
    </div>
  );
}

const MenuItem = (props: {
  link: string;
  icon: React.ReactNode;
  label: string;
}) => {
  const { link, icon, label } = props;
  return (
    <Link
      href={link}
      className="col-span-1 flex flex-col items-center justify-center relative rounded-lg p-2 lg:py-4 px-2 group cursor-pointer shadow-lg hover:shadow-sm "
    >
      <div className="absolute inset-0 bg-gray-700  rounded-lg opacity-10 z-10 h-full"></div>

      <div className="flex items-center justify-center">{icon}</div>
      <div className="mt-2 text-xs text-gray-100 group-hover:text-white hidden lg:block ">
        {label}
      </div>
    </Link>
  );
};

const Stats = ({
  saleTotal,
  orderAmount
}: StatProps) => {

  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)


  return (
    <div className="col-span-4 lg:p-4 p-2 relative">
      <div className="absolute inset-0 bg-gray-100  rounded-lg opacity-10 z-10 h-full"></div>
      <p>{`${getDateFormat(firstDay)} - ${getDateFormat(lastDay)}`}</p>
      <div className=" lg:flex justify-between ">
        <div className=" lg:border-gray-900/5 lg:border-t-0 mb-4 lg:mb-0 z-20">
          <dt className="text font-medium leading-6 flex space-x-1 text-slate-700 ">
            {/* <CircleDollarSign className='w-5 h-5' strokeWidth={1.5} /> */}
            <p>ยอดขาย</p>
          </dt>
          <dd className="mt-2 w-full flex-none text-xl font-medium  text-slate-700 ">
            {getPriceFormat(saleTotal)}
          </dd>
        </div>
        <div className="justify-center border-gray-900/5 lg:border-t-0 ">
          <dt className="text font-medium leading-6  flex space-x-1 text-slate-700">
            {/* <CircleDollarSign className='w-5 h-5 ' strokeWidth={1.5} /> */}
            <p>ยอดสั่งซื้อ</p>
          </dt>
          <dd className="mt-2 w-full flex-none text-xl font-medium text-slate-700 ">
            {getPriceFormat(orderAmount)}
          </dd>
        </div>
      </div>
    </div>
  );
};
