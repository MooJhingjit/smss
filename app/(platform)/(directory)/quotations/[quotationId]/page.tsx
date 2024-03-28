import React from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import CustomerInfo from "./_components/customer-details";
import QuotationTools from "./_components/quotation-tools";
import QuotationLists from "./_components/quotation-lists";
import DocumentItems from "@/components/document-lists";
import PurchaseOrders from "./_components/purchase-orders";
import { db } from "@/lib/db";
import { QuotationListWithRelations } from "@/types";
import { QuotationStatus, QuotationType } from "@prisma/client";
import { InfoIcon } from "lucide-react";
import { classNames } from "@/lib/utils";
import { quotationTypeMapping } from "@/app/config";
import { useUser } from "@/hooks/use-user";

const getData = async (quotationId: string) => {
  const data = await db.quotation.findUnique({
    where: {
      id: parseInt(quotationId),
    },
    include: {
      contact: true,
      seller: true,
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
  });
  return data;
};

interface QuotationIdPageProps {
  params: {
    quotationId: string;
  };
}

export default async function QuotationDetails(
  props: Readonly<QuotationIdPageProps>
) {
  const { params } = props;
  const data = await getData(params.quotationId);
  const { isAdmin } = await useUser();

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

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-sm">Quotation not found</p>
      </div>
    );
  }

  const { contact, lists, status, paymentType, paymentDue } = data;

  const isQT_Approved = !["open", "pending_approval", "offer"].includes(status);
  const isReadonly = ['pending_approval', 'offer', 'approved'].includes(status);
  return (
    <>
      <Breadcrumbs pages={pages} />
      <div className="grid  grid-cols-5 gap-8 mt-6">
        <div className="col-span-5 md:col-span-3">
          {contact && <CustomerInfo data={contact} />}
        </div>
        <div className="col-span-5 md:col-span-2">
          <QuotationTools
            hasList={lists.length > 0}
            isAdmin={isAdmin}
            purchaseOrderRef={data.purchaseOrderRef ?? ""}
            isLocked={data.isLocked}
            quotationId={data.id}
            status={data.status}
            type={data.type}
            paymentType={paymentType}
            paymentDue={
              paymentDue ? new Date(paymentDue).toISOString().split("T")[0] : ""
            }
          />
        </div>
        <div className="col-span-5">
          <QuotationLists
            isLocked={data.isLocked || (!isAdmin &&  isReadonly)}
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
                hasQuotationItems={lists.length > 0}
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
                      อนุมัติ QT
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
