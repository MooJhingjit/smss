"use client";
import DataInfo from "@/components/data-info";
import { useUserModal } from "@/hooks/use-user-modal";
import { User } from "@prisma/client";
import React from "react";

type Props = {
  data: User;
};

export default function CustomerInfo(props: Readonly<Props>) {
  const modal = useUserModal();
  const { data } = props;

  return (
    <DataInfo
      variant="blue"
      columnClassName="grid-cols-1  sm:grid-cols-3"
      header={`ร้านค้า: ${data.name}`}
      lists={[
        { label: "เลขประจำตัวผู้เสียภาษี", value: data.taxId ?? "" },
        { label: "โทร", value: data.phone ?? "" },
        { label: "อีเมล์", value: data.email },
        { label: "ที่อยู่", value: `${data.address ?? ""}` },
      ]}
      onEdit={() => modal.onOpen(data)}
    />
  )
}

//   return (
//     <div className="rounded-md bg-blue-50 p-4 border border-blue-400">
//       <div className="">
//         <div className="flex space-x-2 items-center">
//           <h3 className="text-sm font-medium text-blue-800">{data.name}</h3>
//           <button
//             className="inline-flex cursor-pointer items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
//             onClick={() => modal.onOpen(data)}
//           >
//             Edit
//           </button>
//         </div>
//         <div className="mt-2 text-sm text-blue-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
//           <Item label="เลขประจำตัวผู้เสียภาษี" value={data.taxId ?? ""} />
//           <Item label="โทร" value={data.phone ?? ""} />
//           <Item label="อีเมล์" value={data.email} />
//           <div className="md:col-span-3">
//             <Item label="ที่อยู่" value={data.address ?? ""} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const Item = ({ label, value }: { label: string; value: string }) => (
//   <div className="">
//     <p className="text-gray-500 text-xs">{label}</p>
//     <p className=" text-gray-700">{value}</p>
//   </div>
// );
