"use client";

import { YearSelector } from "./index";

interface SellerTotalNumberProps {
  readonly year: number;
  readonly quotationCount: number;
}

export default function SellerTotalNumber({
  year,
  quotationCount,
}: SellerTotalNumberProps) {
  const stats = [
    { name: "ใบเสนอราคาทั้งปี", value: quotationCount.toString() },
  ];
  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex  items-center justify-center gap-4 flex-wrap md:flex-nowrap">
        <div className="mx-auto flex gap-2 items-center">
          <p className=" font-medium text-black whitespace-nowrap ">
            ปีที่แสดง
          </p>
          <p className=" text-3xl/10 font-medium tracking-tight text-gray-900">
            <YearSelector currentYear={year} />
          </p>
        </div>

        <div className="mx-auto flex gap-2 items-center">
          <p className=" font-medium text-black whitespace-nowrap ">
            ใบเสนอราคาทั้งปี
          </p>
          <p className=" text-3xl/10 font-medium tracking-tight text-gray-900">
            {quotationCount.toString()}
          </p>
        </div>
      </div>
    </div>
  );
}

{
  /* {stats.map((stat) => (
                <div
                    key={stat.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-6 sm:px-6 xl:px-8 border rounded-xl"
                >
                    <dt className="text-sm/6 font-medium text-gray-500">{stat.name}</dt>
                    <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">{stat.value}</dd>
                </div>
            ))} */
}
