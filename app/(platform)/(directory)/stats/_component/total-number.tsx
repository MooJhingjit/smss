"use client"

import YearSelector from "./year-selector"


export default function TotalNumber({ 
    year, 
    quotationCount,
    purchaseOrderCount
}: { 
    year: number;
    quotationCount: number;
    purchaseOrderCount: number;
}) {
    const stats = [
        { name: 'ใบเสนอราคาทั้งปี', value: quotationCount.toString() },
        { name: 'ใบสั่งซื้อทั้งปี', value: purchaseOrderCount.toString() },
    ]
    return (
        <dl className="mx-auto grid grid-cols-1 gap-4  sm:grid-cols-2 lg:grid-cols-4">
            <div
                className="gap-x-4 gap-y-2  px-4 xl:py-10 sm:px-6 xl:px-8 bg-white  col-span-2 sm:col-span-2 lg:col-span-2 flex flex-col justify-center"
            >
                <dt className=" font-medium text-black flex justify-center">ปีที่แสดง</dt>
                <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900 flex justify-center"><YearSelector currentYear={year} />
                </dd>
            </div>
            {stats.map((stat) => (
                <div
                    key={stat.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-6 sm:px-6 xl:px-8 border rounded-xl"
                >
                    <dt className="text-sm/6 font-medium text-gray-500">{stat.name}</dt>
                    <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">{stat.value}</dd>
                </div>
            ))}

        </dl>
    )
}