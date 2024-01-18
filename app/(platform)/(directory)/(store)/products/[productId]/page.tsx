import Breadcrumbs from '@/components/breadcrumbs'

import { Input } from '@/components/ui/input';

import React from 'react'
import ProductItems from './_components/product-items';
import Toolbar from './_components/toolsbar';
import { db } from '@/lib/db';
const pages = [
  {
    name: "All Products",
    href: "/products",
    current: false,
  },
  {
    name: "Wireless Mouse	",
    href: "/products/1",
    current: true,
  },
];


// export type DataType = {
//   id: number,
//   poID: string,
//   name: string,
//   serialNumber: string,
//   warrantyExpires: string,
//   cost: string,
//   status: string,
// }
// const data: DataType[] = [
//   { id: 1, poID: 'P-00101', name: 'CCTV 2.7-13.5mm IP Camera', serialNumber: 'SN001', warrantyExpires: '2026-12-31', cost: '3500', status: 'Pending' },
//   { id: 2, poID: 'P-00101', name: 'Wireless Mouse', serialNumber: 'SN002', warrantyExpires: '2025-12-31', cost: '800', status: 'Pending' },
//   { id: 3, poID: 'P-00101', name: 'Portable Hard Drive 1TB', serialNumber: 'SN003', warrantyExpires: '2027-12-31', cost: '4500', status: 'Pending' },
//   { id: 4, poID: 'P-00104', name: '27-inch LED Monitor', serialNumber: 'SN004', warrantyExpires: '2026-12-31', cost: '12000', status: 'Pending' },
//   { id: 5, poID: 'P-00104', name: 'USB 3.0 Flash Drive 128GB', serialNumber: 'SN005', warrantyExpires: '2025-12-31', cost: '1500', status: 'Pending' },
// ];

async function getData(): Promise<any[]> {
  // findMany returns an array of 10 users
  const users = await db.item.findMany({
    where: {
      productId: 10,
    },
    // take: 10,
    // skip: 0,
    orderBy: {
      id: "asc",
    },
  });
  return users
}

export default async function ProductItemsPage() {

  const data = await getData();


  return (
    <div>
      <Breadcrumbs pages={pages} />

      <div className="pt-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-12">
          {/* Product */}

          <div className="lg:col-start-10 lg:row-end-1 lg:col-end-13 sticky top-32">
            <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
              <dl className="flex flex-wrap">
                <div className="flex px-6 pt-6 items-center justify-between w-full" >
                  <dt className="text-base font-semibold leading-6 text-gray-900">Wireless Mouse</dt>
                  {/* <dd className="text-xs font-semibold leading-6 text-gray-400">Updated 20/12/23</dd> */}
                </div>

                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">

                  <dl className=" space-y-6 border-t border-gray-200 py-6 text-sm font-medium text-gray-900 lg:block  w-full ">
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-600">Vender</dt>
                      <dd>Banana IT</dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-gray-600">Cost</dt>
                      <dd>
                        <Input className='w-20' value={1500} />
                      </dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-gray-600">Percentage</dt>
                      <dd className='flex items-center space-x-2'>
                        <Input type="number" className='w-14' value={15} />
                        <span>%</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </dl>
              {/* <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
                <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
                  Download receipt <span aria-hidden="true">&rarr;</span>
                </a>
              </div> */}
            </div>
          </div>

          {/* Items */}
          <div className="-mx-4 px-4 py-4 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:pb-14 lg:col-span-9 lg:row-span-2 lg:row-end-2  ">
            <div className="flex justify-end">
             <Toolbar />
            </div>
            <div className="overflow-x-scroll mt-3">
              <ProductItems data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
