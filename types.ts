import { User, Product, Quotation } from "@prisma/client";
export type ProductWithVender = Product & { vendor: User };
export type QuotationWithBuyer = Quotation & { buyer: User };
