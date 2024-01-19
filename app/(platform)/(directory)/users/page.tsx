import Breadcrumbs from "@/components/breadcrumbs";
import { columns } from "./_components/columns";
import UserTable from "./_components/data-table";
import { db } from "@/lib/db";

const pages = [
  {
    name: "All Users",
    href: "/users",
    current: true,
  },
];

async function getData(): Promise<any[]> {
  // findMany returns an array of 10 users
  const users = await db.user.findMany({
    // take: 10,
    // skip: 0,
    orderBy: {
      id: "asc",
    },
  });
  return users;
}

export default async function UserPage() {
  const data = await getData();

  return (
    <>
      <Breadcrumbs pages={pages} />
      <UserTable columns={columns} data={data} />
    </>
  );
}
