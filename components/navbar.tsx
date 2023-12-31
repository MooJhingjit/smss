"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";

export default function MainNavbar(props: { showMenu?: boolean }) {
  const { showMenu = false } = props;

  return (
    <div
      className={classNames(
        "fixed top-0 w-full h-14 px-4 shadow  flex items-center ",
        showMenu ? "bg-white" : ""
      )}
    >
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
        <div className="space-x-2 md:w-auto flex items-center justify-between">
          <p className="text-xs">Admin</p>
          <Button
            asChild
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 cursor-pointer"
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
  const pathname = usePathname();
  const isActive = (path: string) => {
    const currentPath = pathname.split("?")[0]; // Remove query parameters

    // Special handling for the root path "/"
    if (path === "/") {
      return currentPath === "/";
    }

    // Check if the current path starts with the specified path
    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
    return currentPath.startsWith(normalizedPath);
  };
  return (
    <div className="hidden md:flex items-center space-x-4 text-sm text-slate-700">
      <Link href="/" >
        Home
      </Link>
      <Link
        href="/quotation"
        className={classNames(
          isActive("/quotation") ? "text-primary-700 font-semibold" : ""
        )}
      >
        Quotations
      </Link>
      <Link href="/orders">Orders</Link>
      <Link href="/directory">Store</Link>
      <Link href="/">Users</Link>
    </div>
  );
}
