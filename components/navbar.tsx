import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { classNames } from "@/lib/utils";

export default function MainNavbar(props: { showMenu?: boolean }) {
  const { showMenu = false } = props;

  return (
    <div className="fixed top-0 w-full h-14 px-4 shadow  flex items-center">
      {!showMenu && (
        <div className="absolute inset-0 bg-gray-700 opacity-20 z-10"></div>
      )}

      <div className="relative z-20 mx-auto max-w-6xl flex items-center w-full justify-between">
        {/* <div className="w-8 h-8 bg-white"></div> */}
        <h1
          className={classNames(
            "font-semibold text-lg",
            showMenu ? "text-gray-700" : "text-white"
          )}
        >
          SmartSolution
        </h1>
        {showMenu && <MenuItems />}
        <div className="space-x-4 md:block md:w-auto flex items-center justify-between w-full">
          <Button
            asChild
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500"
          >
            {/* <Link href="/sign-in">Login</Link> */}
            <span className="text-xs font-medium leading-none text-white">
              P
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function MenuItems() {
  return (
    <div className="hidden md:flex items-center space-x-4 text-sm text-slate-700">
      <Link href="/quotation">Home</Link>
      <Link href="/quotation">Quotations</Link>
      <Link href="/quotation">PO</Link>
      <Link href="/directory">Store</Link>
      <Link href="/">Users</Link>
    </div>
  );
}
