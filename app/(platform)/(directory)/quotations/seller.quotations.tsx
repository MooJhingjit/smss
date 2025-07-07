import Breadcrumbs from "@/components/breadcrumbs";
import { columns } from "./_components/columns";
import ContactTable from "./_components/data-table";
import { db } from "@/lib/db";
import { useUser } from "@/hooks/use-user";

const pages = [
  {
    name: "ใบเสนอราคาทั้งหมด (QT)",
    href: "/quotations",
    current: true,
  },
];

async function GetData(): Promise<any[]> {
  const { info } = await useUser();

  if (!info?.id) {
    return [];
  }
  // findMany returns an array of 10 users
  const contacts = await db.quotation.findMany({
    include: {
      contact: true,
    },
    where: {
      sellerId: parseInt(info.id),
    },
    // take: 10,
    // skip: 0,
    orderBy: {
      id: "desc",
    },
  });
  return contacts;
}

export default async function QuotationTablePage() {
  const data = await GetData();

  return (
    <>
      <Breadcrumbs pages={pages} />
      <ContactTable columns={columns} data={data} />
    </>
  );
}
