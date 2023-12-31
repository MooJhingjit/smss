import React from "react";

export default function CustomerInfo() {
  return (
    <div className="rounded-md bg-yellow-50 p-4 border border-yellow-400">
      <div className="">
        <div className="flex space-x-2 items-center">
          <h3 className="text-sm font-medium text-yellow-800">
            Pokkrong Jhingjit
          </h3>
          <span className="inline-flex cursor-pointer items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            Edit
          </span>
        </div>
        <div className="mt-2 text-sm text-yellow-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <Item label="Tax ID" value="1029939948938" />
          <Item label="Tel." value="0938847789" />
          <Item label="Email" value="m.jhingjit@gmail.com" />
          <div className="md:col-span-3">
            <Item
              label="Address"
              value="28/15 Soi Sukhumvit 36 Sukhumvit Road Klongton, Bangkok 39449"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const Item = ({ label, value }: { label: string; value: string }) => (
  <div className="">
    <p className="text-gray-500 text-xs">{label}</p>
    <p className=" text-gray-700">{value}</p>
  </div>
);
