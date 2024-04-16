"use client"
import React from "react";
import { handleSignOut } from "@/actions/auth";
import { LogOutIcon } from "lucide-react";

export default function LogoutButton() {
    const onSignOut = async () => {
        handleSignOut();
      };
      
  return (
    <button
      onClick={onSignOut}
      className="cursor-pointer group relative space-y-1 flex flex-col items-center gap-x-6 rounded-lg p-4 hover:bg-gray-50"
    >
      <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
        <LogOutIcon className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
      </div>
      <p className="text-sm text-gray-900">SignOut</p>
    </button>
  );
}
