import { paymentTypeMapping } from '@/app/config'
import { getDateFormat } from '@/lib/utils'
import { PurchaseOrderPaymentType } from '@prisma/client'
import { Coins, CreditCard } from 'lucide-react'
import React from 'react'

export default function PaymentBadge({ paymentType, paymentDue }: { paymentType: PurchaseOrderPaymentType, paymentDue?: string | Date }) {
  return (
    <div className="inline-flex items-start rounded-md  px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
      {paymentType === "credit" ? (
        <CreditCard className="w-4 h-4 mr-1" />
      ) : (
        <Coins className="w-4 h-4 mr-1" />
      )}
      <div className="">
        <p>{paymentTypeMapping[paymentType]}</p>

        {
          paymentType === 'credit' && paymentDue && (
            <p className=''>Due: {getDateFormat(paymentDue)}</p>
          )
        }
      </div>
    </div>
  )
}
