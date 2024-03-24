import React from "react";
import BoardContainer from "./_components/board-container";
import { useUser } from "@/hooks/use-user";
import QuotationTablePage from "./seller.quotations";

export default async function QuotationBoard() {
  const { isAdmin } = await useUser();

  if (isAdmin) {
    return (
      <div className="overflow-x-auto">
        <BoardContainer />
      </div>
    );
  }

  return <QuotationTablePage />;
}
