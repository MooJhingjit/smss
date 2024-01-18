import { User, Product, Quotation, Item } from "@prisma/client";
export type ProductWithRelations = Product & { items?: Item[], vendor?: User };
export type QuotationWithBuyer = Quotation & { buyer: User };
export type ItemWithRefs = Item & { productRef: { id: number, name: string }, vendorRef?: { id: number | undefined, name: string | undefined } };
export type ItemRefs = undefined | { productRef: { id: number, name: string }, vendorRef?: { id: number | undefined, name: string | undefined } };
