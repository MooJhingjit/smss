import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function MainNavbar() {
  return (
    <div className="fixed top-0 w-full h-14 px-4 shadow  flex items-center">
      <div className="absolute inset-0 bg-gray-700 opacity-20 z-10"></div>
      <div className="relative z-20 mx-auto max-w-6xl flex items-center w-full justify-between">
        {/* <div className="w-8 h-8 bg-white"></div> */}
        <h1 className="text-white font-semibold text-lg">SmartSolution</h1>
        <div className="space-x-4 md:block md:w-auto flex items-center justify-between w-full">
          <Button size="sm" variant="outline" asChild>
            <Link href="/sign-in">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
