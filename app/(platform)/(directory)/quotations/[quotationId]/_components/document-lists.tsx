import React from "react";
import { Upload, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import PageComponentWrapper from "@/components/page-component-wrapper";

const docs = [
  {
    name: "PO1.pdf",
    created_at: "2023/12/30",
  },
  {
    name: "inv.pdf",
    created_at: "2023/12/25",
  },
  // {
  //   name: "PO1.pdf",
  //   created_at: "2023/12/5",
  // },
  // {
  //   name: "PO4.pdf",
  //   created_at: "2023/12/5",
  // },
];

export default function DocumentItems() {
  return (
    <PageComponentWrapper
      headerIcon={
        <Upload className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700" />
      }
      headerTitle="Documents"
    >
      <ul role="list" className="divide-y divide-gray-100 ">
        {docs.map((doc) => (
          <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-1 gap-2">
                <span className="truncate font-medium">{doc.name}</span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
              <span className="flex-shrink-0 text-gray-400 text-xs">
                {format(new Date(doc.created_at), "MMM d, yyyy")}
              </span>
              <Download className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700" />
              <Trash2 className="w-4 h-4 text-red-300 cursor-pointer hover:text-red-700" />
            </div>
          </li>
        ))}
      </ul>
    </PageComponentWrapper>
  );
}
