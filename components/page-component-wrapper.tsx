'use client'
import React from "react";
import { classNames } from "@/lib/utils";

type Props = {
  children?: React.ReactNode;
  headerIcon?: React.ReactNode;
  headerTitle: string;
};
export default function PageComponentWrapper(props: Props) {
  const { children, headerIcon, headerTitle } = props;
  return (
    <div className="space-y-2">
      <div className="flex space-x-2 items-center">
        <p className="text-sm">{headerTitle}</p>
        <div className="">{headerIcon}</div>
      </div>
      <div className={
        classNames(
          "mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 p-2 rounded-md",
          children ? 'border border-gray-200 ' : ''
        )
      }>
        {children}
      </div>
    </div>
  );
}
