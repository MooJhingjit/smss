import { getDateFormat } from "@/lib/utils";
import { PurchaseOrderWithRelations } from "@/types";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { render } from "react-dom";

export const purchaseOrderColumns = [
  { name: "Code", key: "code" },
  {
    name: "ผู้ขาย/ร้านค้า",
    key: "name",
    render: (item: PurchaseOrderWithRelations) => {
      return item.vendor?.name;
    },
  },
  // { name: "ส่วนลด", key: "discount" },
  {
    name: "ราคาสั่งซื้อ", key: "totalPrice",
    render: (item: PurchaseOrderWithRelations) => {
      return item.totalPrice?.toLocaleString("th-TH", {
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
    name: "สร้างเมื่อ",
    key: "createdAt",
    render: (item: PurchaseOrderWithRelations) => {
      return getDateFormat(item.createdAt);
    },
  },
  {
    name: "",
    key: "id",
    render: (item: PurchaseOrderWithRelations) => {
      return (
        <Link href={`/purchase-orders/${item.id}`}>
          <ExternalLink className="w-4 h-4" />
        </Link>
      );
    },
  },
];
