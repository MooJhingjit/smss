import React from "react";
import BoardContainer from "./_components/board-container";
import { db } from "@/lib/db";
import { QuotationWithBuyer } from "@/types";

async function getData(): Promise<QuotationWithBuyer[]> {
  const quotations = await db.quotation.findMany({
    // take: 10,
    // skip: 0,
    where: {
      status: {
        equals: "pending",
      },
    },
    include: {
      buyer: true,
    },
    orderBy: {
      id: "desc",
    },
  });
  return quotations;
}

export default async function QuotationBoard() {
  const data = await getData()
  const allQuotations = {
    'pending': data
  }
  console.log(allQuotations)
  return (
    <div className="h-full overflow-x-auto">
      <BoardContainer data={allQuotations}/>
    </div>
  );
}
