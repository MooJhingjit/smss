'use client'
import React, { use } from "react";

type Props = {
  children: React.ReactNode;
  headerIcon?: React.ReactNode;
  headerTitle: string;
};
export default function PageComponentWrapper(props: Props) {
  const { children, headerIcon, headerTitle } = props;
  return (
    <div className="space-y-2">
      <div className="flex space-x-2 items-center">
        <p className="text-sm">{headerTitle}</p>
        {headerIcon}
      </div>
      <div className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 border border-gray-200 p-2 rounded-md">
        {children}
      </div>
    </div>
  );
}
