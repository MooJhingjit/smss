import React from "react";
import { KanbanSquare, Box, Users } from "lucide-react";
import Link from "next/link";
// import { create } from '@/actions/create-user'

export default function ShortcutMenus() {

  return (
    <div className="grid grid-cols-6 gap-4">
      <Stats />
      <MenuItem
        icon={
          <KanbanSquare
            className="w-4 h-4 lg:w-8 lg:h-8  text-white"
            strokeWidth={1.5}
          />
        }
        label="QT ทั้งหมด"
        link="/quotations"
      />
      
      <MenuItem
        icon={
          <Box
            className="w-4 h-4 lg:w-8 lg:h-8  text-white"
            strokeWidth={1.5}
          />
        }
        label="กลุ่มสินค้า"
        link="/products"
      />
     
      <MenuItem
        icon={
          <Users
            className="w-4 h-4 lg:w-8 lg:h-8  text-white"
            strokeWidth={1.5}
          />
        }
        label="ลูกค้า"
        link="/contacts"
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

const Stats = () => {
  return (
    <div className="col-span-3 lg:flex  relative py-2">
      {/* <div className="absolute inset-0 bg-gray-100  rounded-lg opacity-10 z-10 h-full"></div> */}

      <div className=" lg:border-gray-900/5 lg:border-t-0 mb-4 lg:mb-0">
        <dt className="text-sm font-medium leading-6 text-slate-800">
          <p>ยอดขายรวม</p>
        </dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          ฿405,091.00
        </dd>
      </div>
      {/* <div className="justify-center border-gray-900/5 lg:border-t-0 ">
        <dt className="text font-medium leading-6  flex space-x-1 text-slate-700">
          <p>ยอดสั่งซื้อ</p>
        </dt>
        <dd className="mt-2 w-full flex-none text-xl font-medium text-slate-700 ">
          ฿???
        </dd>
      </div> */}

      {/* <div className="absolute top-2 right-2">
        <p className='text-[10px] text-gray-50 relative'>
          <sub className='absolute top-[5px] left-[-6px]'>*</sub>
          Last 30 days summary</p>
      </div> */}
    </div>
  );
};
