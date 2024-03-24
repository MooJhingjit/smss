import React from "react";
import { useUser } from "@/hooks/use-user";
import AdminHomePage from "./admin.page";
import SellerHomePage from "./seller.page";

export default async function HomePage() {
  const { isAdmin } = await useUser();

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-6xl px-2 xl:px-0">
        <AdminHomePage />{" "}
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-6xl px-2 xl:px-0">
      <SellerHomePage />
    </div>
  );
}
