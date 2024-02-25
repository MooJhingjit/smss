import {
  User,
  Product,
  Quotation,
  Item,
  QuotationList,
  PurchaseOrder,
  PurchaseOrderItemStatus,
  PurchaseOrderItem,
} from "@prisma/client";
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    token?: JWT;
    accessToken?: string;
  }
}
export type ProductWithRelations = Product & { items?: Item[]; vendor?: User };

export type QuotationWithBuyer = Quotation & { buyer: User };
export type ItemWithRefs = Item & {
  productRef: { id: number; name: string };
  vendorRef?: { id: number | undefined; name: string | undefined };
};
export type ItemRefs =
  | undefined
  | {
      productRef: { id: number; name: string };
      vendorRef?: { id: number | undefined; name: string | undefined };
    };
export type QuotationListWithRelations = QuotationList & {
  product: ProductWithRelations;
  quotation: Quotation;
};
export type PurchaseOrderWithRelations = PurchaseOrder & {
  purchaseOrderItems?: PurchaseOrderItemWithRelations[];
  vendor?: User;
  quotation?: Quotation;
};

export type PurchaseOrderPreview = {
  id: number;
  vendor: User;
  totalPrice: number;
  totalDiscount: number;
  quantity: number;
};

export type PurchaseOrderItemWithRelations = PurchaseOrderItem & {
  items: Item[];
};
