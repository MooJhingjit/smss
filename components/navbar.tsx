import React from "react";
import Link from "next/link";
import { classNames } from "@/lib/utils";
import Image from "next/image";
import LOGO from "@/public/logo.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserRoundCog } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import MenuItems from "./navbar.menus";
import LogoutButton from "./logout-button";

export default async function MainNavbar(props: { withNavigation?: boolean }) {
  const { withNavigation = false } = props;

  const { info, isAdmin } = await useUser();
  // console.log("client get session >>>>>", user);

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
            "font-semibold text-lg",
            withNavigation ? "text-gray-700" : "text-white"
          )}
        >
          <Image src={LOGO} width={80} height={80} alt="Logo" />
        </Link>
        {withNavigation && info?.role && <MenuItems userRole={info?.role} />}
        <div className="space-x-2 md:w-auto flex items-center justify-between">
          <div
            className={classNames(
              "hidden md:flex text-xs text-gray-500 text-right capitalize md:justify-center md:items-center space-x-1 ",
              withNavigation ? "text-gray-700" : "text-white"
            )}
          >
            <p>{info?.name}</p>
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
                {/* <button className="cursor-pointer group relative space-y-1  flex flex-col items-center gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                  <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <UserRoundCog className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-900">Profile</p>
                </button> */}
                <LogoutButton />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
