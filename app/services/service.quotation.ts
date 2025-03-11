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
  items: QuotationList[]
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
  const vat = total * 0.07
  const grandTotal = total + vat
  return { ...summary, vat, grandTotal}
};

// export const summarizeQuotationTotalPrice = (quotationListsByVendor: {
//   [key: number]: QuotationListWithRelations[];
// }) => {
//   let sumTotalPrice: number = 0;
//   let sumDiscount: number = 0;
//   let sumTotalTax: number = 0;

//   Object.keys(quotationListsByVendor).map((vendorId) => {
//     // loop through each vendor

//     const lists = quotationListsByVendor[Number(vendorId)];
//     const { totalPrice, discount, tax } =
//       calculateQuotationItemPrice(lists);

//     // summary for all quotations (all vendors)
//     sumTotalPrice += totalPrice;
//     sumDiscount += discount;
//     sumTotalTax += tax;
//   });

//   const grandTotal = sumTotalPrice - sumDiscount + sumTotalTax
//   return { sumTotalPrice, sumDiscount, sumTotalTax, grandTotal };
// };
