"use client";
import React from "react";
import { PurchaseOrderPaymentType } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormInput } from "@/components/form/form-input";
type Props = {
  paymentType: PurchaseOrderPaymentType;
  paymentDue: string;
  onUpdate: (payload: { paymentDue?: string, paymentType?: PurchaseOrderPaymentType }) => void;
}

export default function PaymentOptionControl(props: Props) {

  const { paymentType, paymentDue, onUpdate } = props;
  
  const [paymentTypeState, setPaymentTypeState] = React.useState(paymentType);

  const onPaymentTypeUpdate = (type: PurchaseOrderPaymentType) => {

    setPaymentTypeState(type);
    if (type === PurchaseOrderPaymentType.cash) {
      // reset payment due
      onUpdate({
        paymentDue: "",
        paymentType: PurchaseOrderPaymentType.cash
      });
    }
  }

  return (
    <div className="flex space-x-2 items-center">
      {
        paymentTypeState == PurchaseOrderPaymentType.credit && (
          <div className="w-[140px] -mt-1">
            <FormInput
              id="paymentDue"
              label=""
              type="date"
              placeholder="กำหนดชำระ"
              defaultValue={paymentDue}
              onChange={(e) => {
                const value = e.target.value;
                if (!value || paymentDue === value) return;
                onUpdate({
                  paymentDue: value,
                  paymentType: PurchaseOrderPaymentType.credit
                });
              }}
            />
          </div>
        )
      }
      <Tabs defaultValue={paymentTypeState} className="w-[150px]">
        <TabsList className="w-full flex">
          <TabsTrigger
            className="flex-1 text-xs"
            value="cash"
            onClick={() => onPaymentTypeUpdate("cash")}
          >
            เงินสด
          </TabsTrigger>
          <TabsTrigger
            className="flex-1 text-xs"
            value="credit"
            onClick={() => onPaymentTypeUpdate("credit")}
          >
            เครดิต
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
