import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/breadcrumbs";
import { QuotationWithRelations } from "@/types";
import { QuotationInstallment } from "@prisma/client";
import { db } from "@/lib/db";
import { useUser } from "@/hooks/use-user";
import DataNotfound from "@/components/data-notfound";
import InstallmentTable from "./_components/installment-table";
import PaymentSummary from "./_components/payment-summary";
import { quotationTypeMapping } from "@/app/config";
import { ExternalLink, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

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

  const quotation = (await db.quotation.findUnique({
    where,
    include: {
      contact: true,
      seller: true,
      billGroup: true,
      installments: {
        orderBy: {
          id: "asc",
        },
      },
    },
  })) as QuotationWithRelations;

  return {
    quotation,
    installments: quotation?.installments || [],
  };
};

interface InstallmentPageProps {
  params: {
    "qt-id": string;
  };
}

export default async function InstallmentDetailPage(
  props: Readonly<InstallmentPageProps>
) {
  const { params } = props;
  const { isAdmin, info } = await useUser();
  const quotationId = params["qt-id"];

  const result = await getData(quotationId, isAdmin, info?.id);

  if (!result || !result.quotation) {
    return <DataNotfound link="/quotations" />;
  }

  const { quotation, installments } = result;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const pages = [
    {
      name: "ใบเสนอราคาทั้งหมด (QT)",
      href: "/quotations",
      current: false,
    },
    {
      name: quotation.code,
      href: `/quotations/${quotation.id}`,
      current: false,
    },
    {
      name: "ผ่อนชำระ",
      href: "",
      current: true,
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs pages={pages} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quotation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center  gap-2">
              <p>รายละเอียดใบเสนอราคา</p>
              <Link
                href={`/quotations/${quotation.id}`}
                className="flex items-center underline"
              >
                <span> {quotation.code}</span>
                <ExternalLinkIcon className="ml-1 h-3.5 w-3.5" />
              </Link>
              {/* <div className="flex items-center justify-center gap-2">
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  {quotation.code}

                  <ExternalLinkIcon className="ml-1 h-3.5 w-3.5" />
                </Badge>
               
              </div> */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ลูกค้า</p>
                <p>{quotation.contact?.name || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ประเภท</p>
                <Badge className="capitalize" variant="secondary">
                  {quotationTypeMapping[quotation?.type]}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  เงื่อนไขการชำระ
                </p>
                <p>{quotation.paymentCondition || "-"} วัน</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  ยอดรวมทั้งสิ้น
                </p>
                <p className="font-semibold">
                  {formatCurrency(quotation.grandTotal || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary with Chart */}
        <PaymentSummary installments={installments} />

        {/* Installment Table */}
        <div className="col-span-1 md:col-span-2">
          <InstallmentTable
            installments={installments}
            quotationId={quotation.id}
          />
        </div>
      </div>
    </div>
  );
}
