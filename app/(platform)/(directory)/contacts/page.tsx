import Breadcrumbs from "@/components/breadcrumbs";
import { columns, sellerColumns } from "./_components/columns";
import ContactTable from "./_components/data-table";
import { db } from "@/lib/db";
import { useUser } from "@/hooks/use-user";
import { User } from "@prisma/client";

const pages = [
  {
    name: "ลูกค้าทั้งหมด",
    href: "/contacts",
    current: true,
  },
];

async function getData(isAdmin: boolean, userId: string): Promise<any[]> {
  let conditions = {
    where: {},
  };

  if (!isAdmin) {
    conditions = {
      where: {
        isProtected: false,
        sellerId: parseInt(userId),
      },
    };
  }
  // findMany returns an array of 10 users
  const contacts = await db.contact.findMany({
    include: {
      user: true,
    },
    where: conditions.where,
    // take: 10,
    // skip: 0,
    orderBy: {
      id: "asc",
    },
  });
  return contacts;
}

export default async function ContactPage() {
  const { isAdmin, info } = await useUser();
  const data = await getData(isAdmin, info?.id ?? "");
  return (
    <>
      <Breadcrumbs pages={pages} />
      <ContactTable columns={isAdmin ? columns : sellerColumns} data={data} />
    </>
  );
}
