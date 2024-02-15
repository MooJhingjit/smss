"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";
import Image from "next/image";
import LOGO from "@/public/logo.png";

export default function MainNavbar(props: { showMenu?: boolean }) {
  const { showMenu = false } = props;

  return (
    <div
      className={classNames(
        "fixed top-0 w-full h-14 px-4 shadow  flex items-center ",
        showMenu
          ? "bg-primary-50 bg-gradient-to-r  from-primary-400 via-primary-100  to-primary-50 shadow-lg"
          : "",
      )}
    >
      {!showMenu && (
        <div className="absolute inset-0 bg-gray-700 opacity-20 z-10"></div>
      )}

      <div className="relative z-20 mx-auto max-w-6xl flex items-center w-full justify-between">
        {/* <div className="w-8 h-8 bg-white"></div> */}
        <Link
          href="/"
          className={classNames(
            "font-semibold text-lg",
            showMenu ? "text-gray-700" : "text-white",
          )}
        >
          <Image src={LOGO} width={80} height={80} alt="Logo" />
        </Link>
        {showMenu && <MenuItems />}
        <div className="space-x-2 md:w-auto flex items-center justify-between">
          <p
            className={classNames(
              "hidden md:block text-xs text-gray-500",
              showMenu ? "text-gray-700" : "text-white",
            )}
          >
            Admin
          </p>
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
      <Link
        href="/quotations"
        className={classNames(
          isActive("/quotations")
            ? "text-primary-600 font-semibold"
            : "text-gray-500 font-semibold",
        )}
      >
        Quotations
      </Link>
      <Link
        href="/purchase-orders"
        className={classNames(
          isActive("/purchase-orders")
            ? "text-primary-600 font-semibold"
            : "text-gray-500 font-semibold",
        )}
      >
        Purchase Orders
      </Link>
      <Link
        href="/products"
        className={classNames(
          isActive("/products")
            ? "text-primary-600 font-semibold"
            : "text-gray-500 font-semibold",
        )}
      >
        Products
      </Link>
      <Link
        href="/users"
        className={classNames(
          isActive("/users")
            ? "text-primary-600 font-semibold"
            : "text-gray-500 font-semibold",
        )}
      >
        Users
      </Link>
    </div>
  );
}
