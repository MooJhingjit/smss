import Breadcrumbs from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
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

const productDetails = [
  { id: 1, poID: 'P-00101', name: 'CCTV 2.7-13.5mm IP Camera', serialNumber: 'SN001', warrantyExpires: '2026-12-31', cost: '3500', status: 'Pending' },
  { id: 2, poID: 'P-00101', name: 'Wireless Mouse', serialNumber: 'SN002', warrantyExpires: '2025-12-31', cost: '800', status: 'Pending' },
  { id: 3, poID: 'P-00101', name: 'Portable Hard Drive 1TB', serialNumber: 'SN003', warrantyExpires: '2027-12-31', cost: '4500', status: 'Pending' },
  { id: 4, poID: 'P-00104', name: '27-inch LED Monitor', serialNumber: 'SN004', warrantyExpires: '2026-12-31', cost: '12000', status: 'Pending' },
  { id: 5, poID: 'P-00104', name: 'USB 3.0 Flash Drive 128GB', serialNumber: 'SN005', warrantyExpires: '2025-12-31', cost: '1500', status: 'Pending' },
  { id: 6, poID: 'P-00106', name: 'Ergonomic Keyboard', serialNumber: 'SN006', warrantyExpires: '2025-12-31', cost: '2000', status: 'Pending' },
  { id: 7, poID: 'P-00106', name: 'Graphic Tablet', serialNumber: 'SN007', warrantyExpires: '2026-12-31', cost: '6000', status: 'Pending' },
  { id: 8, poID: 'P-00106', name: 'Wi-Fi Router AC1200', serialNumber: 'SN008', warrantyExpires: '2025-12-31', cost: '3200', status: 'Pending' },
  { id: 9, poID: 'P-00106', name: 'Bluetooth Speakers', serialNumber: 'SN009', warrantyExpires: '2026-12-31', cost: '2800', status: 'Pending' },
  { id: 10, poID: 'P-00106', name: 'HD Webcam', serialNumber: 'SN010', warrantyExpires: '2026-12-31', cost: '2200', status: 'Pending' }
];

export default function ProductDetailsPage() {
  return (
    <div>
      <Breadcrumbs pages={pages} />

      <div className="pt-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-12">
          {/* Product */}

          <div className="lg:col-start-10 lg:row-end-1 lg:col-end-13">
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
              <div className="w-[300px] flex rounded-md shadow-sm">
                <div className="relative flex flex-grow items-stretch focus-within:z-10">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <Input name="search" placeholder='Search by name' className='pl-10'
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-scroll">
              <table className="mt-2 w-full whitespace-nowrap text-left text-sm leading-6">
                <thead className="border-b border-gray-200 text-gray-900">
                  <tr>
                    <th className="px-0 py-3 font-semibold">
                      Purchase ID
                    </th>
                    <th className="px-0 py-3 font-semibold text-center">
                      Name
                    </th>
                    <th className="px-0 py-3 font-semibold text-center">
                      Serial Number
                    </th>
                    <th className="px-0 py-3 font-semibold text-center">
                      Warranty
                    </th>
                    <th className="px-0 py-3 font-semibold text-center">
                      Cost
                    </th>
                    <th className="px-0 py-3 font-semibold text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productDetails.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="px-0 py-5">
                        <Link href={`/purchases/1`} className='underline text-xs'>
                          {item.poID}
                        </Link>
                      </td>
                      <td className="pr-1 py-5">
                        <Input className='text-xs w-42 md:w-full' value={item.name} />
                      </td>
                      <td className="pr-1 py-5">
                        <Input className='text-xs w-full' value={item.serialNumber} />
                      </td>
                      <td className="px-0 py-5">
                        <Input type="date" className='w-32 text-xs' value={item.warrantyExpires} />
                      </td>
                      <td className="px-0 py-5">
                        <Input className='text-xs w-20' value={item.cost} />
                      </td>
                      <td className="px-0 py-5">
                        <select
                          className=" block w-20 rounded-md border-0 py-1.5 pl-3  text-gray-900 ring-0 focus:ring-0 text-xs"
                          defaultValue="Pending"
                        >
                          <option>Pending</option>
                          <option>Claim</option>
                        </select>
                      </td>

                    </tr>
                  ))}
                  {/* add button */}
                  <tr>
                    <td colSpan={6} className="px-0 py-5">
                      <Button className='w-full flex space-x-2 items-center group' variant='secondary'>
                        <Plus
                          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700"
                        />
                        <span className='text-gray-400 group-hover:text-gray-700 '>Wireless Mouse (Banana IT)</span>
                      </Button>
                    </td>
                  </tr>
                </tbody>

              </table>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}
