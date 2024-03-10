"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";
import Image from "next/image";
import LOGO from "@/public/logo.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOutIcon, UserRoundCog } from "lucide-react";
import { handleSignOut } from "@/actions/auth";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function MainNavbar(props: { showMenu?: boolean }) {
  const { showMenu = false } = props;
  const onSignOut = async () => {
    handleSignOut();
  };
  const user = useCurrentUser();
  // console.log("client get session >>>>>", user);

  return (
    <div
      className={classNames(
        "fixed top-0 w-full h-14 px-4 shadow  flex items-center z-[999]",
        showMenu
          ? "bg-primary-50 bg-gradient-to-r  from-primary-400 via-primary-100  to-primary-50 shadow-lg"
          : ""
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
            showMenu ? "text-gray-700" : "text-white"
          )}
        >
          <Image src={LOGO} width={80} height={80} alt="Logo" />
        </Link>
        {showMenu && <MenuItems />}
        <div className="space-x-2 md:w-auto flex items-center justify-between">
          <div
            className={classNames(
              "hidden md:flex text-xs text-gray-500 text-right capitalize md:justify-center md:items-center space-x-1 ",
              showMenu ? "text-gray-700" : "text-white"
            )}
          >
            <p>{user?.name}</p>
            <p>({user?.role})</p>
          </div>
          <Popover>
            <PopoverTrigger>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 cursor-pointer">
                <span className="text-xs font-medium leading-none text-white">
                  P
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="relative z-[99999]">
              <div className=" flex justify-evenly">
                <button className="cursor-pointer group relative space-y-1  flex flex-col items-center gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                  <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <UserRoundCog className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-900">Profile</p>
                </button>
                <button
                  onClick={onSignOut}
                  className="cursor-pointer group relative space-y-1 flex flex-col items-center gap-x-6 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <LogOutIcon className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-900">SignOut</p>
                </button>
              </div>
            </PopoverContent>
          </Popover>
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
            : "text-gray-500 font-semibold"
        )}
      >
        ใบเสนอราคา (QT)
      </Link>
      <Link
        href="/purchase-orders"
        className={classNames(
          isActive("/purchase-orders")
            ? "text-primary-600 font-semibold"
            : "text-gray-500 font-semibold"
        )}
      >
        การสั่งซื้อ (PO)
      </Link>
      <Link
        href="/products"
        className={classNames(
          isActive("/products")
            ? "text-primary-600 font-semibold"
            : "text-gray-500 font-semibold"
        )}
      >
        กลุ่มสินค้า/บริการ
      </Link>
      <Link
        href="/items"
        className={classNames(
          isActive("/items")
            ? "text-primary-600 font-semibold"
            : "text-gray-500 font-semibold"
        )}
      >
        คลังสินค้า
      </Link>
      <Link
        href="/users"
        className={classNames(
          isActive("/users")
            ? "text-primary-600 font-semibold"
            : "text-gray-500 font-semibold"
        )}
      >
        ผู้ใช้งาน
      </Link>
    </div>
  );
}
