import React from "react";
import { KanbanSquare, Box, Users } from "lucide-react";
import Link from "next/link";
import { getDateFormat, getPriceFormat } from "@/lib/utils";
// import { create } from '@/actions/create-user'

type Props = {
  saleTotal: number;
};

export default function ShortcutMenus(props: Props) {
  const { saleTotal } = props;
  return (
    <div className="">
      <div className="grid grid-cols-3 gap-4">
        <MenuItem
          icon={
            <KanbanSquare
              className="w-4 h-4 lg:w-8 lg:h-8  text-white"
              strokeWidth={1.5}
            />
          }
          label="ใบเสนอราคา (QT)"
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
      <div className="mt-4">
        <Stats saleTotal={saleTotal} />
      </div>
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

const Stats = ({ saleTotal }: { saleTotal: number }) => {
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

  return (
    <div className="col-span-3 lg:flex  relative py-2">
      <div className=" lg:border-gray-900/5 lg:border-t-0 mb-4 lg:mb-0">
        <dt className="text-sm font-medium leading-6 text-slate-800 flex items-center space-x-2">
          <p>ยอดขายรวม</p>
          <p>{`${getDateFormat(firstDay)} - ${getDateFormat(lastDay)}`}</p>
        </dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {getPriceFormat(saleTotal)}
        </dd>
      </div>
    </div>
  );
};
