import { FileSearch } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function DataNotfound({
  textLink = "กลับไปหน้าหลัก",
  link,
}: {
  textLink?: string;
  link: string;
}) {
  return (
    <div className="flex h-screen justify-center items-center flex-col">
      <FileSearch className="w-12 h-12 text-gray-400" />
      <div className="flex justify-center  space-x-1  text-sm mt-4">
        <p className="text-gray-500">ไม่มีรายการนี้</p>
        <Link href={link} className="text-primary underline">
          {textLink}
        </Link>
      </div>
    </div>
  );
}
