"use client"
import { Button } from '@/components/ui/button'
import { useProductModal } from '@/hooks/use-product-modal'
import { ProductWithRelations } from '@/types'
import React from 'react'

type Props = {
  data: ProductWithRelations
}
export default function ProductView(props: Props) {
  const modal = useProductModal();
  const { data } = props
  const { name, cost, percentage, vendor, updatedAt, description } = data

  const onUpdate = () => {
    modal.onOpen(data);
  };

  return (
    <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
      <div className="flex px-6 pt-6 items-center justify-between w-full" >
        <dt className="text-base font-semibold leading-6 text-gray-900">{name}</dt>
      </div>
      <div className="mt-4 flex w-full flex-none gap-x-4 px-6">

        <dl className=" space-y-6 border-t border-gray-200 py-6 text-xs font-medium text-gray-900 lg:block  w-full ">
          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Vender</dt>
            <dd>{vendor?.name}</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Cost</dt>
            <dd>
              {cost}
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Percentage</dt>
            <dd className='flex items-center space-x-2'>
              {percentage?.toString()}%
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Updated</dt>
            <dd>
              {
                new Date(updatedAt).toLocaleDateString()
              }
            </dd>
          </div>

          {
            description && (
              <dd>
                <p className='text-xs text-gray-600 text-center'>
                  {description
                  }
                </p>
              </dd>
            )
          }
          <dd>
            <div className="w-full">
              <Button variant='default' onClick={onUpdate} className='w-full'>Update</Button>
            </div>
          </dd>
        </dl>


      </div>
    </div>
  )
}
