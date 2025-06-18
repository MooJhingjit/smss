import React from "react";
import { currentUser } from "@/lib/auth";
import AdminHomePage from "@home_features/admin.page";
import SellerHomePage from "@home_features/seller.page";

export default async function HomePage({
  searchParams,
}: {
  readonly searchParams: { year?: string };
}) {
  const user = await currentUser();
  const isAdmin = user?.role === "admin";

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-2 xl:px-0">
        <AdminHomePage />
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-7xl px-2 xl:px-0">
      <SellerHomePage searchParams={searchParams} />
    </div>
  );
}
