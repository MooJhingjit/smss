import { QuotationListWithRelations } from "@/types";
import { QuotationList } from "@prisma/client";

export const groupQuotationByVendor = (
  quotationLists: QuotationListWithRelations[]
) => {
  return quotationLists.reduce<{ [key: number]: QuotationListWithRelations[] }>(
    (acc, curr) => {
      if (!acc[curr.product.vendorId]) {
        acc[curr.product.vendorId] = [];
      }
      acc[curr.product.vendorId].push(curr);
      return acc;
    },
    {}
  );
};

export const calculateQuotationItemPrice = (
  items: QuotationList[],
  vatIncluded: boolean = true
) => {

  // get total price and discount for each vendor
  const summary = items.reduce(
    (acc, curr) => {
      const quantity = curr.quantity ?? 0;
      return {
        totalCost: acc.totalCost + (curr.cost ?? 0) * quantity, // excluded interest (%) to generate PO
        totalPrice: acc.totalPrice + (curr.unitPrice ?? 0) * quantity, // included interest (%)
        discount: acc.discount + (curr.discount ?? 0),
        quantity: acc.quantity + quantity,
        // tax: acc.tax + (curr.withholdingTax ?? 0),
      };
    },
    {
      totalCost: 0,
      totalPrice: 0,
      discount: 0,
      quantity: 0,
      // tax: 0,
    }
  );

  const total = summary.totalPrice - summary.discount
  const vat = vatIncluded ? total * 0.07 : 0
  const grandTotal = total + vat
  return { ...summary, vat, grandTotal}
};
