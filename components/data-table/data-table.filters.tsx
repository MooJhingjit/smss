'use client'
import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Plus, Search } from 'lucide-react'

interface Props {
  onCreate: () => void;
}
export default function TableFilter(props: Props) {
  const { onCreate } = props;
  return (
    <div className='grid grid-cols-3 mt-4 md:mt-0'>
      <div className="start-1 col-span-3 md:col-start-2 lg:col-start-3 md:col-span-2 lg:col-span-1 flex items-center space-x-2">
        <div className="flex rounded-md shadow-sm w-full">
          <div className="relative flex flex-grow items-stretch focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <Input name="search"
            />
          </div>

        </div>
        <Button variant="secondary" className='h-[36px]'
          onClick={onCreate}
        >
          <Plus size={20} />
        </Button>
      </div>

    </div>
  )
}
