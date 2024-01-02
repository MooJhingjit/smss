import React from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import VenderInfo from "./_components/vender-details";
import OrderStatus from "./_components/order-status";
import OrderItems from "./_components/order-items";
import AssociateOrders from "./_components/associate-orders";

const pages = [
  {
    name: "Purchase Orders",
    href: "/purchase-orders",
    current: false,
  },
  {
    name: "PO-0001",
    href: "",
    current: true,
  },
];
export default function QuotationDetails() {
  return (
    <>
      <Breadcrumbs pages={pages} />
      <div className="grid grid-cols-5 gap-8 mt-6">
        <div className="col-span-3">
          <VenderInfo />
        </div>
        <div className="col-span-2">
          <OrderStatus />
        </div>
        <div className="col-span-5">
          <OrderItems />
        </div>
        
        <div className="col-span-5">
          <AssociateOrders/>
        </div>
        
      </div>
    </>
  );
}
