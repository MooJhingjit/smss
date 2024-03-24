"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import { classNames } from "@/lib/utils";
import { UserRole } from "@prisma/client";

const links = [
  { href: "/quotations", label: "ใบเสนอราคา (QT)", permission: ["*"] },
  {
    href: "/purchase-orders",
    label: "การสั่งซื้อ (PO)",
    permission: ["admin"],
  },
  { href: "/products", label: "กลุ่มสินค้า/บริการ", permission: ["*"] },
  { href: "/items", label: "คลังสินค้า", permission: ["admin"] },
  { href: "/contacts", label: "ลูกค้า", permission: ["*"] },
  { href: "/users", label: "ผู้ใช้งาน", permission: ["admin"] },
];

export default function MenuItems({ userRole }: { userRole: UserRole }) {
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
      {links
      .filter((link) => link.permission.includes(userRole) || link.permission.includes("*"))
      .map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={classNames(
            isActive(link.href)
              ? "text-primary-600 font-semibold"
              : "text-gray-500 font-semibold"
          )}
        >
          {link.label}
        </Link>
      ))}
      {/* <Link
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
        href="/contacts"
        className={classNames(
          isActive("/contacts")
            ? "text-primary-600 font-semibold"
            : "text-gray-500 font-semibold"
        )}
      >
        ลูกค้า
      </Link>
      {isAdmin && (
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
      )} */}
    </div>
  );
}
