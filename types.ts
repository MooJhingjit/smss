import { User, Product } from '@prisma/client';
export type ProductWithVender = Product & { vender: User };