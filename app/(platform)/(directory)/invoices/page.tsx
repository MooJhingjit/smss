import Breadcrumbs from "@/components/breadcrumbs";
import { columns } from "./_components/columns";
import InvoiceTable from "./_components/data-table";
import { db } from "@/lib/db";
import { getDateFormat } from "@/lib/utils";

async function getData(): Promise<any[]> {
  const items = await db.invoice.findMany({
    include: {
      quotation: {
        select: {
          id: true,
          code: true,
        },
      },
      billGroup: {
        select: {
          id: true,
          code: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return items;
}

interface Props {
  params: {
    invoiceId: string;
  };
}

export default async function Invoices(props: Readonly<Props>) {
  const data = await getData();

  // Format the dates
  const formattedData = data.map((invoice) => ({
    ...invoice,
    date: invoice.date ? getDateFormat(invoice.date) : null,
    receiptDate: invoice.receiptDate ? getDateFormat(invoice.receiptDate) : null,
  }));

  const pages = [
    {
      name: "ใบแจ้งหนี้ - ใบเสร็จ",
      href: "/invoices",
      current: false,
    },
  ];

  return (
    <>
      <Breadcrumbs pages={pages} />
      <InvoiceTable columns={columns} data={formattedData} />
    </>
  );
}
