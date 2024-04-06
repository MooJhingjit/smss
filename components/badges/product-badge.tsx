import { ProductType } from "@prisma/client";
import { Lock } from "lucide-react";
import React from "react";

export default function ProductBadge({
  name,
  type,
}: {
  name: string;
  type: ProductType;
}) {
  return (
    <div className="flex items-center space-x-2">
      
      <p>{name}</p>
      {type === ProductType.service && (
        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          service
        </span>
      )}
    </div>
  );
}
