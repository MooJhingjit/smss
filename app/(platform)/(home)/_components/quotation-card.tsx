"use client";
import React from "react";
import { useQuotationModal } from "@/hooks/use-quotation-modal";
import CardWrapper from "./card-wrapper";
import { QuotationWithBuyer } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type Props = {
  data: QuotationWithBuyer[];
};
export default function Quotations(props: Props) {
  const { onOpen } = useQuotationModal();
  const { data } = props;
  return (
    <CardWrapper
      title="Quotations"
      description="Recent to 5 quotations ordered by date"
      onCreate={onOpen}
      link="/quotations"
    >
      <Table className="min-w-full divide-y divide-gray-300">
        <TableHeader className="">
          <TableRow>
            <TableHead className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
              Code
            </TableHead>
            <TableHead className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
              Buyer
            </TableHead>
            <TableHead className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
              Payment
            </TableHead>
            <TableHead className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
              Status
            </TableHead>
            <TableHead className="px-3 py-3 text-left text-xs font-semibold text-gray-900"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 bg-white">
          {data.map((quotation) => (
            <TableRow key={quotation.id} className="hover:bg-gray-50">
              <TableCell className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-500">
                {quotation.code}
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-500">
                {quotation.buyer.name}
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-500 capitalize">
                {quotation.paymentType}
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-500 capitalize">
                <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                  {quotation.status}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-500">
                <Link href={`/quotations/${quotation.id}`}>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-700" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardWrapper>
  );
}
