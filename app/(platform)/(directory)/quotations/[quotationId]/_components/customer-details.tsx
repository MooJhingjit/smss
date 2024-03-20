"use client";
import { useContactModal } from "@/hooks/use-contact-modal";
import { Contact } from "@prisma/client";
import React from "react";

type Props = {
  data: Contact;
};

export default function CustomerInfo(props: Readonly<Props>) {
  const modal = useContactModal();
  const { data } = props;
  return (
    <div className="rounded-md bg-yellow-50 p-4 border border-yellow-400">
      <div className="">
        <div className="flex space-x-2 items-center">
          <h3 className="text-sm font-medium text-yellow-800">{data.name}</h3>
          <button
            className="inline-flex cursor-pointer items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
            onClick={() => modal.onOpen(data)}
          >
            Edit
          </button>
        </div>
        <div className="mt-2 text-sm text-yellow-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <Item label="เลขประจำตัวผู้เสียภาษี" value={data.taxId ?? ""} />
          <Item label="โทร" value={data.phone ?? ""} />
          <Item label="อีเมล์" value={data.email} />
          <div className="md:col-span-3">
            <Item label="ที่อยู่" value={data.address ?? ""} />
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
