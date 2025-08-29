"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStatsDetailsModal } from "@/hooks/use-stats-details-modal";
import STAT_SERVICES from "@/app/services/api.stat";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type QuotationRow = {
  id: number;
  code: string;
  status: string;
  approvedAt: string | null;
  totalPrice: number | null;
  grandTotal: number | null;
  contact: { name: string | null } | null;
  seller: { name: string | null } | null;
};

type Response = {
  paid: QuotationRow[];
  unpaid: QuotationRow[];
  installment: QuotationRow[];
};

function formatTHB(n?: number | null) {
  if (!n) return "-";
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);
}

function formatTHBStrict(n: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);
}

const List = ({ items }: { items: QuotationRow[] }) => {
  if (!items?.length) return <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>;

  const totalExcludeVat = items.reduce((acc, q) => acc + (q.totalPrice || 0), 0);
  const totalIncludeVat = items.reduce((acc, q) => acc + (q.grandTotal || 0), 0);

  return (
    <div className="max-h-[50vh] overflow-auto border rounded-md">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-2 py-2">รหัส</th>
            <th className="px-2 py-2">ลูกค้า</th>
            <th className="px-2 py-2">ผู้ขาย</th>
            <th className="px-2 py-2 text-right whitespace-nowrap">ไม่รวม VAT</th>
            <th className="px-2 py-2 text-right">รวม VAT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((q) => (
            <tr key={q.id} className="border-t hover:bg-gray-50">
              <td className="px-2 py-2">
                <Link href={`/quotations/${q.id}`} target="_blank" className="text-blue-600 hover:underline">
                  {q.code}
                </Link>
              </td>
              <td className="px-2 py-2">{q.contact?.name ?? "-"}</td>
              <td className="px-2 py-2">{q.seller?.name ?? "-"}</td>
              <td className="px-2 py-2 text-right">{formatTHB(q.totalPrice)}</td>
              <td className="px-2 py-2 text-right">{formatTHB(q.grandTotal)}</td>
            </tr>
          ))}
          <tr className="border-t-2">
            <td className="px-2 py-2 font-semibold" colSpan={3}>รวม</td>
            <td className="px-2 py-2 text-right font-semibold">{formatTHBStrict(totalExcludeVat)}</td>
            <td className="px-2 py-2 text-right font-semibold">{formatTHBStrict(totalIncludeVat)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ListSkeleton = () => {
  const rowKeys = React.useMemo(
    () =>
      Array.from({ length: 8 }, () =>
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? (crypto as any).randomUUID()
          : Math.random().toString(36).slice(2)
      ),
    []
  );
  return (
    <div className="max-h-[50vh] overflow-auto border rounded-md">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-2 py-2 w-[140px]">รหัส</th>
            <th className="px-2 py-2">ลูกค้า</th>
            <th className="px-2 py-2">ผู้ขาย</th>
            <th className="px-2 py-2 text-right w-[140px] whitespace-nowrap">ไม่รวม VAT</th>
            <th className="px-2 py-2 text-right w-[140px]">รวม VAT</th>
          </tr>
        </thead>
        <tbody>
          {rowKeys.map((key) => (
            <tr key={key} className="border-t">
              <td className="px-2 py-2"><Skeleton className="h-4 w-24" /></td>
              <td className="px-2 py-2"><Skeleton className="h-4 w-48" /></td>
              <td className="px-2 py-2"><Skeleton className="h-4 w-36" /></td>
              <td className="px-2 py-2 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
              <td className="px-2 py-2 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const StatsDetailsModal = () => {
  const modal = useStatsDetailsModal();
  const payload = modal.data;
  const [tab, setTab] = React.useState<"paid" | "unpaid" | "installment">("paid");
  const [data, setData] = React.useState<Response | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!modal.isOpen || !payload) return;
    setTab(payload.initialTab || "paid");
    setIsLoading(true);
    STAT_SERVICES.getDetails({ year: payload.year, month: payload.month })
      .then((res: Response) => setData(res))
      .finally(() => setIsLoading(false));
  }, [modal.isOpen, payload]);

  if (!payload) return null;

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            รายละเอียดยอดขาย {payload.monthLabel} {payload.year}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="paid" className="flex-1">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                <span>ชำระแล้ว</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="unpaid" className="flex-1">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                <span>ยังไม่ชำระ</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="installment" className="flex-1">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                <span>ผ่อนชำระ</span>
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-3">
            {isLoading ? (
              <ListSkeleton />
            ) : (
              <>
                <TabsContent value="paid">
                  <List items={data?.paid || []} />
                </TabsContent>
                <TabsContent value="unpaid">
                  <List items={data?.unpaid || []} />
                </TabsContent>
                <TabsContent value="installment">
                  <List items={data?.installment || []} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
