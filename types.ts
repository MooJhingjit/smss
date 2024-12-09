import {
  User,
  Product,
  Quotation,
  Item,
  QuotationList,
  PurchaseOrder,
  PurchaseOrderItemStatus,
  PurchaseOrderItem,
  Contact,
  Invoice,
} from "@prisma/client";
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

export type QT_TYPE = "product" | "service";
export type ProductWithRelations = Product & { items?: Item[]; vendor?: User };

export type QuotationWithBuyer = Quotation & { contact: Contact };

export type QuotationWithRelations = Quotation & {
  contact?: Contact;
  seller?: User;
  purchaseOrders?: PurchaseOrder[];
  lists?: QuotationList[];
  invoice?: Invoice;
};


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
  quotation?: Quotation | null;
};

export type PurchaseOrderPreview = {
  id: number;
  vendor: User;
  totalCost: number;
  discount: number;
  quantity: number;
};

export type PurchaseOrderItemWithRelations = PurchaseOrderItem & {
  items: Item[];
};
