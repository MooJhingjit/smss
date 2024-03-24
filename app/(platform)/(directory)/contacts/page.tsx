import Breadcrumbs from "@/components/breadcrumbs";
import { columns } from "./_components/columns";
import ContactTable from "./_components/data-table";
import { db } from "@/lib/db";

const pages = [
  {
    name: "ลูกค้าทั้งหมด",
    href: "/contacts",
    current: true,
  },
];

async function getData(): Promise<any[]> {
  // findMany returns an array of 10 users
  const contacts = await db.contact.findMany({
    include: {
      user: true,
    },
    // take: 10,
    // skip: 0,
    orderBy: {
      id: "asc",
    },
  });
  return contacts;
}

export default async function ContactPage() {
  const data = await getData();

  return (
    <>
      <Breadcrumbs pages={pages} />
      <ContactTable columns={columns} data={data} />
    </>
  );
}
