import React from "react";
const products = [
  {
    id: 1,
    name: "Machined Pen and Pencil Set",
    href: "#",
    price: "$70.00",
    status: "Delivered Jan 25, 2021",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/order-history-page-02-product-01.jpg",
    imageAlt:
      "Detail of mechanical pencil tip with machined black steel shaft and chrome lead tip.",
  },
  // More products...
];
// More orders...

export default function QuotationItems() {
  return (
    <div>
      <table className="mt-4 w-full text-gray-500 sm:mt-6">
        <caption className="sr-only">Products</caption>
        <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
          <tr>
            <th scope="col" className="w-1/12">
              #
            </th>
            <th scope="col" className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/3">
              Product
            </th>
            <th
              scope="col"
              className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell"
            >
              Price
            </th>
            <th
              scope="col"
              className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell"
            >
              Unit
            </th>
            <th
              scope="col"
              className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell"
            >
              Unit Price
            </th>
            <th
              scope="col"
              className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell"
            >
              Amount
            </th>

            <th scope="col" className="w-0 py-3 text-right font-normal">
              
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr className="border-b border-gray-200 ">
              <td className="py-6">{index+1}</td>
              <td>td</td>
              <td>td</td>
              <td>td</td>
              <td>td</td>
              <td>td</td>
              <td>td</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
