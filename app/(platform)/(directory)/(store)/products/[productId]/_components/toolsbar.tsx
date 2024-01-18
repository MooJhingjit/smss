'use client'
import React from 'react'
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useItemModal } from '@/hooks/use-item-modal';
export default function Toolbar() {
  const modal = useItemModal();

  const onCreate = () => {
    modal.onOpen();
  }

  return (
    <div className='space-x-1 flex items-center'>
      <div className="w-[300px] flex rounded-md shadow-sm">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <Input name="search" placeholder='Search by name' className='pl-10 text-xs'
          />
        </div>
      </div>
      <Button variant="secondary" className="h-[36px]" onClick={onCreate}>
        <Plus size={20} />
      </Button>
    </div>
  )
}
