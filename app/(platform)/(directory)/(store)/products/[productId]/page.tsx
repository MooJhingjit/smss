import Breadcrumbs from '@/components/breadcrumbs'
import React from 'react'
import ProductItems from './_components/product-items';
import { db } from '@/lib/db';
import ProductView from './_components/product-view';
import { ProductWithRelations } from '@/types';

async function getData(productId: string): Promise<ProductWithRelations | null> {
  const product = await db.product.findUnique(
    {
      where: {
        id: parseInt(productId),
      },
      include: {
        items: true,
        vendor: true,
      },
    }
  )

  return product
}

interface ProductIdPageProps {
  params: {
    productId: string;
  };
};


export default async function ProductItemsPage(props: ProductIdPageProps) {
  const { params } = props;


  const product = await getData(params.productId);

  const pages = [
    {
      name: "All Products",
      href: "/products",
      current: false,
    },
    {
      name: product?.name || "Product",
      href: `/products/${params.productId}`,
      current: true,
    },
  ];

  if (!product) {
    return <div>Not found</div>
  }

  return (
    <div>
      <Breadcrumbs pages={pages} />

      <div className="pt-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-12">
          {/* Product */}

          <div className="lg:col-start-10 lg:row-end-1 lg:col-end-13 sticky top-32">
            <ProductView data={product} />
          </div>

          {/* Items */}
          <div className="-mx-4 px-4 py-4 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:pb-14 lg:col-span-9 lg:row-span-2 lg:row-end-2  ">
            <ProductItems data={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
