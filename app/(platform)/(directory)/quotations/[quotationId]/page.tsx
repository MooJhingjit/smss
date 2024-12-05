import React from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import CustomerInfo from "./_components/customer-details";
import QuotationLists from "./_components/quotation-lists";
import DocumentItems from "@/components/document-lists";
import PurchaseOrders from "./_components/purchase-orders";
import { db } from "@/lib/db";
import { QuotationListWithRelations, QuotationWithRelations } from "@/types";
import { QuotationType } from "@prisma/client";
import { InfoIcon } from "lucide-react";
import { classNames } from "@/lib/utils";
import { quotationTypeMapping } from "@/app/config";
import { useUser } from "@/hooks/use-user";
import DataNotfound from "@/components/data-notfound";
import QuotationInfo from "./_components/quotation-info";

const getData = async (
  quotationId: string,
  isAdmin: boolean,
  userId?: string
) => {
  if (!userId) {
    return null;
  }

  // Start with an empty where clause
  const where: { id: number; sellerId?: number } = {
    id: parseInt(quotationId), // Always include the id
  };

  // If the user is not an admin, add the sellerId condition
  if (!isAdmin) {
    where.sellerId = parseInt(userId);
  }

  const data = await db.quotation.findUnique({
    where,
    include: {
      contact: true,
      seller: true,
      invoice: true,
      purchaseOrders: {
        include: {
          vendor: true,
        },
      },
      lists: {
        include: {
          product: {
            include: {
              vendor: true,
            },
          },
        },
      },
    },
  }) as QuotationWithRelations

  // get all quotations that are in the same bill group
  const quotationsGroup = (data?.billGroupId) ? await db.quotation.findMany({
    select: {
      id: true,
      code: true,
      grandTotal: true,
    },
    where: {
      billGroupId: data.billGroupId,
      id: {
        not: parseInt(quotationId),
      }
    },
  }) : [];


  return {
    data,
    quotationsGroup
  }
}
interface QuotationIdPageProps {
  params: {
    quotationId: string;
  };
}

export default async function QuotationDetails(
  props: Readonly<QuotationIdPageProps>
) {
  const { params } = props;
  const { isAdmin, info } = await useUser();
  const res = await getData(params.quotationId, isAdmin, info?.id);


  if (!res || !res.data) {
    return <DataNotfound link="/quotations" />;
  }

  const { data, quotationsGroup } = res;

  
  const pages = [
    {
      name: "ใบเสนอราคาทั้งหมด (QT)",
      href: "/quotations",
      current: false,
    },
    {
      name: data?.code ?? "",
      render: () => {
        return (
          <div>
            <p
              className={classNames(
                "rounded bg-gray-100 px-2 py-0.5 text-xs tracking-wide text-gray-600 space-x-2",
                data?.type === QuotationType.service ? "text-green-600" : ""
              )}
            >
              <span>{data?.code}</span>
              <span className="capitalize">
                ({data && quotationTypeMapping[data?.type]})
              </span>
            </p>
          </div>
        );
      },
      href: "",
      current: true,
    },
  ];

  const { contact, lists, status } = data;

  const isQT_Approved = !["open", "pending_approval", "offer"].includes(status);
  const isReadonly = ["pending_approval", "offer", "approved"].includes(status);
  return (
    <>
      <Breadcrumbs pages={pages} />
      <div className="grid  grid-cols-5 gap-8 mt-6">
        <div className="col-span-5 md:col-span-2">
          {contact && <CustomerInfo data={contact} />}
        </div>
        <div className="col-span-5 md:col-span-3">
          <QuotationInfo
            quotationsGroup={quotationsGroup}
            data={data}
          />
        </div>
        <div className="col-span-5">
          <QuotationLists
            isLocked={data.isLocked || (!isAdmin && isReadonly)}
            quotationId={data.id}
            quotationType={data.type}
            remark={data.remark ?? ""}
            data={lists as QuotationListWithRelations[]}
          />
        </div>
        <div className="col-span-5 md:col-span-2">
          <DocumentItems refType="quotation" refId={data.id} />
        </div>
        {isAdmin && (
          <div className="col-span-5 md:col-span-3">
            {isQT_Approved ? (
              <PurchaseOrders
                quotationLists={lists as QuotationListWithRelations[]}
                hasQuotationItems={!!(lists && lists.length > 0)}
                quotationId={data.id}
              />
            ) : (
              <div className="mt-6 bg-gray-50 w-full h-40 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <InfoIcon className="w-10 h-10 text-yellow-500" />
                  </div>
                  <p className="text-gray-700 font-semibold">
                    การสร้างใบสั่งซื้อ(PO) จากใบเสนอราคา(QT)แบบอัตโนมัติ
                  </p>
                  <div className="flex space-x-1 items-center text-sm">
                    <p>ใบเสนอราคาต้องอยู่ในสถานะได้รับการอนุมัติ</p>
                    <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 border-yellow-400 border">
                      ลูกค้าอนุมัติ QT แล้ว
                    </span>
                    <p>ถึงจะสามารถสร้างใบ PO ได้</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
