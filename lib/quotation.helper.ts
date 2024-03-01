import { QuotationListWithRelations } from "@/types";

export const getQuotationGroupByVendor = (quotationLists: QuotationListWithRelations[]) => {
  return quotationLists.reduce<{ [key: number]: QuotationListWithRelations[] }>((acc, curr) => {
    if (!acc[curr.product.vendorId]) {
      acc[curr.product.vendorId] = []
    }
    acc[curr.product.vendorId].push(curr)
    return acc
  }, {})
}
export const getQuotationTotalPrice = (items: QuotationListWithRelations[]) => {
  // get total price and discount for each vendor
  const summary = items.reduce((acc, curr) => {
    const quantity = curr.quantity ?? 0
    return {
      totalCost: acc.totalCost + ((curr.cost ?? 0) * quantity),
      totalPrice: acc.totalPrice + ((curr.price ?? 0) * quantity),
      totalDiscount: acc.totalDiscount + (curr.discount ?? 0),
      quantity: acc.quantity + quantity,
      totalTax: acc.totalTax + (curr.withholdingTax ?? 0) 
    }
  }
    , {
      totalCost: 0,
      totalPrice: 0,
      totalDiscount: 0,
      quantity: 0,
      totalTax: 0
    })

  return summary
}