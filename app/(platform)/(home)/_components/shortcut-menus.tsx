import React from 'react'
import { KanbanSquare, Receipt, Box, CircleDollarSign } from 'lucide-react'
import Link from 'next/link'

export default function ShortcutMenus() {
  return (
    <div className='grid grid-cols-3 gap-4'>
      <MenuItem
        icon={<KanbanSquare className='w-12 h-12 text-white' strokeWidth={1.5} />}
        label="QT Board"
        link="/quotations"
      />
      <MenuItem
        icon={<Receipt className='w-12 h-12 text-white' strokeWidth={1.5} />}
        label="POs"
        link="/purchases"
      />
      <MenuItem
        icon={<Box className='w-12 h-12 text-white' strokeWidth={1.5} />}
        label="Products"
        link="/products"
      />
      <Stats />
    </div>
  )
}

const MenuItem = (props: {
  link: string
  icon: React.ReactNode
  label: string
}) => {
  const { link, icon, label } = props
  return (
    <Link
      href={link}
      className='col-span-1 flex flex-col items-center justify-center relative rounded-lg p-4 group cursor-pointer shadow-lg hover:shadow-sm '>
      <div className="absolute inset-0 bg-gray-700  rounded-lg opacity-10 z-10 h-full"></div>

      <div className='flex items-center justify-center'>
        {icon}
      </div>
      <div className='mt-2 text-sm text-gray-100 group-hover:text-white'>{label}</div>
    </Link>
  )
}

const Stats = () => {
  return (
    <div className="col-span-3 flex justify-between relative p-6">
      <div className="absolute inset-0 bg-gray-100  rounded-lg opacity-10 z-10 h-full"></div>

      <div className="border-t border-gray-900/5 lg:border-t-0 ">
        <dt className="text font-medium leading-6 flex space-x-1 text-slate-700 ">
          {/* <CircleDollarSign className='w-5 h-5' strokeWidth={1.5} /> */}
          <p>Sales</p>
        </dt>
        <dd className="mt-2 w-full flex-none text-xl font-medium  text-slate-700 ">฿405,091.00</dd>
      </div>
      <div className="justify-center  border-t border-gray-900/5 lg:border-t-0 ">
        <dt className="text font-medium leading-6  flex space-x-1 text-slate-700">
          {/* <CircleDollarSign className='w-5 h-5 ' strokeWidth={1.5} /> */}
          <p>Orders</p>
        </dt>
        <dd className="mt-2 w-full flex-none text-xl font-medium text-slate-700 ">฿305,091.00</dd>
      </div>

      {/* <div className="absolute top-2 right-2">
        <p className='text-[10px] text-gray-50 relative'>
          <sub className='absolute top-[5px] left-[-6px]'>*</sub>
          Last 30 days summary</p>
      </div> */}

    </div>
  )
}

