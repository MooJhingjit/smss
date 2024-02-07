import { User, Product, Quotation, Item, QuotationList, PurchaseOrder, PurchaseOrderItemStatus, PurchaseOrderItem } from "@prisma/client";
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
  purchaseOrderItems?: PurchaseOrderItem[];
  vendor?: User;
  quotation?: Quotation;
};

export type PurchaseOrderPreview = {
  id: number;
  vendor : User;
  totalPrice : number;
  totalDiscount : number;
  quantity : number;
}