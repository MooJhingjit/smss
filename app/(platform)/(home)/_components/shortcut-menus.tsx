"use client";
import React from "react";
import { KanbanSquare, Receipt, Box, Users } from "lucide-react";
import Link from "next/link";
// import { create } from '@/actions/create-user'

export default function ShortcutMenus() {

  return (
    <div className="grid grid-cols-4 gap-4">
      <MenuItem
        icon={
          <KanbanSquare
            className="w-6 h-6 lg:w-12 lg:h-12  text-white"
            strokeWidth={1.5}
          />
        }
        label="QT ทั้งหมด"
        link="/quotations"
      />
      <MenuItem
        icon={
          <Receipt
            className="w-6 h-6 lg:w-12 lg:h-12  text-white"
            strokeWidth={1.5}
          />
        }
        label="PO ทั้งหมด"
        link="/purchase-orders"
      />
      <MenuItem
        icon={
          <Box
            className="w-6 h-6 lg:w-12 lg:h-12  text-white"
            strokeWidth={1.5}
          />
        }
        label="สินค้า/บริการ"
        link="/products"
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
      <Stats />
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

const Stats = () => {
  return (
    <div className="col-span-4 lg:flex justify-between relative lg:p-4 p-2">
      <div className="absolute inset-0 bg-gray-100  rounded-lg opacity-10 z-10 h-full"></div>

      <div className=" lg:border-gray-900/5 lg:border-t-0 mb-4 lg:mb-0">
        <dt className="text font-medium leading-6 flex space-x-1 text-slate-700 ">
          {/* <CircleDollarSign className='w-5 h-5' strokeWidth={1.5} /> */}
          <p>ยอดขาย</p>
        </dt>
        <dd className="mt-2 w-full flex-none text-xl font-medium  text-slate-700 ">
          ฿405,091.00
        </dd>
      </div>
      <div className="justify-center border-gray-900/5 lg:border-t-0 ">
        <dt className="text font-medium leading-6  flex space-x-1 text-slate-700">
          {/* <CircleDollarSign className='w-5 h-5 ' strokeWidth={1.5} /> */}
          <p>ยอดสั่งซื้อ</p>
        </dt>
        <dd className="mt-2 w-full flex-none text-xl font-medium text-slate-700 ">
          ฿305,091.00
        </dd>
      </div>

      {/* <div className="absolute top-2 right-2">
        <p className='text-[10px] text-gray-50 relative'>
          <sub className='absolute top-[5px] left-[-6px]'>*</sub>
          Last 30 days summary</p>
      </div> */}
    </div>
  );
};
