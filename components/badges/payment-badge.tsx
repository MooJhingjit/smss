import { paymentTypeMapping } from '@/app/config'
import { PurchaseOrderPaymentType } from '@prisma/client'
import { Coins, CreditCard } from 'lucide-react'
import React from 'react'

export default function PaymentBadge({ paymentType }: { paymentType: PurchaseOrderPaymentType }) {
  return (
    <span className="inline-flex items-center rounded-md  px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
      {paymentType === "credit" ? (
        <CreditCard className="w-4 h-4 mr-1" />
      ) : (
        <Coins className="w-4 h-4 mr-1" />
      )}
      {paymentTypeMapping[paymentType]}
    </span>
  )
}
