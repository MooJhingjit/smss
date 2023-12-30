import React from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import CustomerInfo from "./_components/CustomerInfo";
import QuotationStatus from "./_components/QuotationStatus";
import QuotationItems from "./_components/QuotationItems";
import DocumentItems from "./_components/DocumentItems";

const pages = [
  {
    name: "Quotations",
    href: "/quotations",
    current: false,
  },
  {
    name: "QT-0001",
    href: "",
    current: true,
  },
];
export default function QuotationDetails() {
  return (
    <>
      <Breadcrumbs pages={pages} />
      <div className="grid grid-cols-5 gap-8 mt-10">
        <div className="col-span-3">
          <CustomerInfo />
        </div>
        <div className="col-span-2">
          <QuotationStatus />
        </div>
        <div className="col-span-5">
          <QuotationItems />
        </div>
        <div className="col-span-2">
          <DocumentItems />
        </div>
        <div className="col-span-3">
          {/* <QuotationStatus /> */}
        </div>
      </div>
    </>
  );
}
