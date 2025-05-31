"use client";
import React, { useState } from "react";
import Link from "next/link";
import { classNames } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { handleSignOut } from "@/actions/auth";
import { getFilteredLinks } from "@/config/routing";

interface MobileNavbarProps {
    userRole: UserRole;
    withNavigation: boolean;
}

export default function MobileNavbar({ userRole, withNavigation }: MobileNavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const onSignOut = async () => {
        handleSignOut();
    };

    const isActive = (path: string) => {
        const currentPath = pathname.split("?")[0];
        if (path === "/") {
            return currentPath === "/";
        }
        const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
        return currentPath.startsWith(normalizedPath);
    };

    const filteredLinks = getFilteredLinks(userRole);

    if (!withNavigation || filteredLinks.length === 0) {
        return null;
    }

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
            </button>

            {/* Mobile menu overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 h-screen" onClick={() => setIsOpen(false)}>
                    <div
                        className="fixed top-14 left-0 right-0 bg-slate-700 shadow-lg h-full flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col justify-between">
                            <div className="px-2 pt-2 pb-3 space-y-1 flex-1">
                                {filteredLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={classNames(
                                            "block px-3 py-6 rounded-md text-base font-medium transition-colors text-center",
                                            isActive(link.href)
                                                ? "bg-gray-600 text-white"
                                                : "text-gray-300 hover:bg-gray-600 hover:text-white"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            {/* Logout section at the bottom */}
                            <div className="flex-0 px-2 pb-4 border-t pt-10 border-gray-600  flex items-center justify-center mt-10">
                                <Button
                                    onClick={onSignOut}
                                    variant={"outline"} className="w-auto px-10 text-red-600" >
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
