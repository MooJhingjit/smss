import React from "react";
import Quotations from "./components/overview.quotations";
import ShortcutMenus from "./components/shortcut-menus";
import PurchaseOrders from "./components/overview.purchase-orders";
import { db } from "@/lib/db";
import { QuotationWithBuyer } from "@/types";
import { PurchaseOrder, PurchaseOrderStatus, QuotationStatus, User } from "@prisma/client";
import StatisticCard from "./components/statistics";
import Tasks from "./components/tasks";
import { currentUser } from "@/lib/auth";
import { quotationStatusMapping } from "@/app/config";
import PaymentDue from "./components/paymentDue";

export type PurchaseOrderWithVendor = PurchaseOrder & { vendor: User };

async function getData(): Promise<
  [
    QuotationWithBuyer[],
    PurchaseOrderWithVendor[],
    QuotationWithBuyer[],
    QuotationWithBuyer[],
    PurchaseOrderWithVendor[],
    { _sum: { totalPrice: number | null } },
    { _sum: { totalPrice: number | null } },
    { _sum: { grandTotal: number | null } }
  ]
> {
  const quotations = db.quotation.findMany({
    include: {
      contact: true,
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const tasks = db.quotation.findMany({
    include: {
      contact: true,
    },
    where: {
      status: "pending_approval",
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const purchaseOrders = db.purchaseOrder.findMany({
    include: {
      vendor: true,
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const dateToAlert = new Date();
  dateToAlert.setDate(dateToAlert.getDate() + 5);

  const quotationsDueDate = db.quotation.findMany({
    include: {
      contact: true,
    },
    where: {
      paymentDue: {
        lte: dateToAlert,
      },
      status: {
        notIn: [QuotationStatus.paid],
      }
    },
    orderBy: {
      paymentDue: "desc",
    },
  });

  const purchaseOrdersDueDate = db.purchaseOrder.findMany({
    include: {
      vendor: true,
    },
    where: {
      paymentDue: {
        lte: dateToAlert,
      },
      status: {
        notIn: [PurchaseOrderStatus.paid],
      }
    },
    orderBy: {
      paymentDue: "desc",
    },
  });

  // count all total price for current month
  const saleTotal = db.quotation.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
      },
    },
  });

  const saleTotalWithVat = db.quotation.aggregate({
    _sum: {
      grandTotal: true,
    },
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
      },
    },
  });

  const orderAmount = db.purchaseOrder.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      quotationId: {
        not: null,
      },
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });

  const data = await Promise.all([
    quotations,
    purchaseOrders,
    tasks,
    quotationsDueDate,
    purchaseOrdersDueDate,
    saleTotal,
    orderAmount,
    saleTotalWithVat
  ]);
  return data;
}

export default async function AdminHomePage() {
  const [
    quotations,
    purchaseOrders,
    tasks,
    quotationsDueDate,
    purchaseOrdersDueDate,
    saleTotal,
    orderAmount,
    saleTotalWithVat
  ] = await getData();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="md:col-span-6 col-span-12">
        <div className="relative h-full rounded-xl overflow-hidden ">
          <div className="h-full w-full">
            <ShortcutMenus
              saleTotal={saleTotal._sum.totalPrice ?? 0}
              saleTotalWithVat={saleTotalWithVat._sum.grandTotal ?? 0}
              orderAmount={orderAmount._sum.totalPrice ?? 0}
            />
          </div>
        </div>
      </div>
      <div className="md:col-span-6 col-span-12">
        <Tasks
          data={tasks}
          label={`รออนุมัติ สถานะ: ${quotationStatusMapping["offer"].label}`}
        />
      </div>
      <div className="lg:col-span-6 col-span-12">
        <PaymentDue
          type="quotations"
          data={quotationsDueDate}
          label={`ถึงกำหนดชำระ (QT Credit)`}
        />
      </div>
      <div className="lg:col-span-6 col-span-12">
        <PaymentDue
          type="purchase-orders"
          data={purchaseOrdersDueDate}
          label={`ถึงกำหนดชำระ (PO Credit)`}
        />
      </div>
      <div className="lg:col-span-6 col-span-12">
        <Quotations data={quotations} />
      </div>
      <div className="lg:col-span-6 col-span-12">
        <PurchaseOrders data={purchaseOrders} />
      </div>
      <div className="col-span-12">
        <StatisticCard />
      </div>
    </div>
  );
}
