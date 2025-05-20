import { purchaseOrderStatusMapping } from "@/app/config";
import StatusBadge from "@/components/badges/status-badge";
import { getDateFormat } from "@/lib/utils";
import { PurchaseOrderWithRelations } from "@/types";
import { PurchaseOrderStatus } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const purchaseOrderColumns = [
  {
    name: "Code", key: "code",
    render: (item: PurchaseOrderWithRelations) => {
      return (
        <Link href={`/purchase-orders/${item.id}`} className="underline flex items-center space-x-1">
          <ExternalLink className="w-4 h-4" />
          <span>{item.code}</span>
        </Link>
      );
    },
  },
  
  // { name: "ส่วนลด", key: "discount" },
  {
    name: "ราคาสั่งซื้อ", key: "price",
    render: (item: PurchaseOrderWithRelations) => {
      return item.price?.toLocaleString("th-TH", {
        style: "currency",
        currency: "THB",
      });
    }

  },
  {
    name: "ราคาสั่งซื้อรวม vat", key: "grandTotal",
    render: (item: PurchaseOrderWithRelations) => {
      return item.grandTotal?.toLocaleString("th-TH", {
        style: "currency",
        currency: "THB",
      });
    }

  },
  {
    name: "สถานะ",
    key: "status",
    render: (item: PurchaseOrderWithRelations) => {
      return (
        <StatusBadge status={purchaseOrderStatusMapping[item.status]}

          isWarning={item.status === PurchaseOrderStatus.product_received}
          isSuccess={item.status === PurchaseOrderStatus.paid} />

      );
    },
  },
  {
    name: "สร้างเมื่อ",
    key: "createdAt",
    render: (item: PurchaseOrderWithRelations) => {
      return getDateFormat(item.createdAt);
    },
  },
  {
    name: "ผู้ขาย/ร้านค้า",
    key: "name",
    render: (item: PurchaseOrderWithRelations) => {
      return item.vendor?.name;
    },
  },
  // {
  //   name: "",
  //   key: "id",
  //   render: (item: PurchaseOrderWithRelations) => {
  //     return (
  //       <Link href={`/purchase-orders/${item.id}`}>
  //         <ExternalLink className="w-4 h-4" />
  //       </Link>
  //     );
  //   },
  // },
];
