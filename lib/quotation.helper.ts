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
  const totalPrice = items.reduce((acc, curr) => {
    return acc + ((curr.cost ?? 0) * (curr.quantity ?? 0))
  }, 0)

  const quantity = items.reduce((acc, curr) => {
    return acc + (curr.quantity ?? 0)
  }, 0)

  // TODO  TBC
  // const totalDiscount = quotationListsByVendor[vendorIdNum].reduce((acc, curr) => {
  //   return acc + (curr?.discount ?? 0)
  // }, 0)

  return {
    totalPrice,
    totalDiscount: 0,
    quantity
  }
}