"use client";
import React from "react";
import { KanbanSquare, Receipt, Box, Users, PackageOpen, FileClock } from "lucide-react";
import Link from "next/link";


export default function ShortcutMenus() {
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
        icon={<FileClock className="w-6 h-6 lg:w-12 lg:h-12  " strokeWidth={1.5} />}
        label="ผ่อนชำระ"
        link="/installments"
      />

      <MenuItem
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 lg:w-14 lg:h-14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 17V9" />
            <path d="M18 17V5" />
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <path d="M8 17v-3" />
          </svg>
        }
        label="รายงาน"
        link="/stats"
        isNewTab
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

