"use client";
import React from "react";
import Link from "next/link";
import { classNames } from "@/lib/utils";
import Image from "next/image";
import LOGO from "@/public/logo.png";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentRole } from "@/hooks/use-current-role";
import MenuItems from "./navbar.menus";
import MobileNavbar from "./mobile-navbar";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { handleSignOut } from "@/actions/auth";

export default function MainNavbar(props: { withNavigation?: boolean }) {
  const { withNavigation = false } = props;

  const info = useCurrentUser();
  const userRole = useCurrentRole();
  const isAdmin = userRole === "admin";

  const name = info?.name ?? "";
  // console.log("client get session >>>>>", user);
  const onSignOut = async () => {
    handleSignOut();
  };
  return (
    <div
      className={classNames(
        "fixed top-0 w-full h-14 px-4  flex items-center z-[999] bg-slate-700 shadow-lg",
        // withNavigation &&
        //   isAdmin &&
        //   "bg-primary-50 bg-gradient-to-r  from-primary-400 via-primary-100  to-primary-50",
        withNavigation &&
        !isAdmin &&
        "bg-primary/50 bg-gradient-to-r  from-primary/40 via-primary  to-primary/50"
      )}
    >
      {/* {!withNavigation && (
        <div className="absolute inset-0 bg-gray-700 opacity-20 z-10"></div>
      )} */}

      <div className="relative z-20 mx-auto max-w-6xl flex items-center w-full justify-between">
        {/* <div className="w-8 h-8 bg-white"></div> */}
        <Link
          href="/"
          className={classNames(
            "font-semibold text-lg text-white",
            // withNavigation ? "text-gray-700" : "text-white"
          )}
        >
          <Image src={LOGO} width={80} height={80} alt="Logo" />
        </Link>
        {withNavigation && userRole && <MenuItems userRole={userRole} />}

        <div className="flex  items-center">
          <div className="hidden lg:w-auto lg:flex items-center justify-between">
            {/* <div
              className={classNames(
                "hidden lg:flex text-xs text-right capitalize lg:justify-center lg:items-center space-x-1 text-white",
              )}
            >
              <p>{info?.name}</p>
            </div> */}



            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full">{name ? name.charAt(0).toUpperCase() : "U"}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled>
                    {info?.name}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {/* <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Email</DropdownMenuItem>
                        <DropdownMenuItem>Message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>More...</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    New Team
                    <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>GitHub</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuItem disabled>API</DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="cursor-pointer"
                >
                  Log out
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* <Popover>
              <PopoverTrigger>
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 cursor-pointer">
                  <span className="text-xs font-medium leading-none text-white">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="relative z-[99999]">
                <div className=" flex justify-evenly">
                 
                  <LogoutButton />
                </div>
              </PopoverContent>
            </Popover> */}
          </div>
          {/* Mobile Navigation */}
          {withNavigation && userRole && (
            <MobileNavbar userRole={userRole} withNavigation={withNavigation} />
          )}</div>
      </div>
    </div>
  );
}
