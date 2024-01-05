import Breadcrumbs from "@/components/breadcrumbs"
import { User, columns } from "./columns"
import UserTable from "./data-table"

const pages = [
  {
    name: "All Users",
    href: "/users",
    current: true,
  },
];

async function getData(): Promise<User[]> {
  // Fetch data from your API here.
  return [
    { id: '001', name: 'John Doe', phone: '123-456-7890', email: 'john.doe@example.com', address: '1234 Maple St, Anytown, AN', type: 'user' },
    { id: '002', name: 'Jane Smith', phone: '234-567-8901', email: 'jane.smith@example.com', address: '2345 Oak St, Othertown, OT', type: 'admin' },
    { id: '003', name: 'Emily Johnson', phone: '345-678-9012', email: 'emily.johnson@example.com', address: '3456 Pine St, Sometown, ST', type: 'vender' },
    { id: '004', name: 'Michael Brown', phone: '456-789-0123', email: 'michael.brown@example.com', address: '4567 Birch St, Newtown, NT', type: 'user' },
    { id: '005', name: 'Chloe Wilson', phone: '567-890-1234', email: 'chloe.wilson@example.com', address: '5678 Cedar St, Mytown, MT', type: 'admin' },
    { id: '006', name: 'William Anderson', phone: '678-901-2345', email: 'william.anderson@example.com', address: '6789 Spruce St, Yourtown, YT', type: 'vender' },
    { id: '007', name: 'Sophia Thomas', phone: '789-012-3456', email: 'sophia.thomas@example.com', address: '7890 Fir St, Theirtown, TT', type: 'user' },
    { id: '008', name: 'Noah Lee', phone: '890-123-4567', email: 'noah.lee@example.com', address: '8901 Elm St, Ourtown, OT', type: 'admin' },
    { id: '009', name: 'Olivia Martin', phone: '901-234-5678', email: 'olivia.martin@example.com', address: '9012 Willow St, Maintown, MT', type: 'vender' },
    { id: '010', name: 'James Davis', phone: '012-345-6789', email: 'james.davis@example.com', address: '0123 Ash St, Theirtown, TT', type: 'user' }
  ]
}

export default async function UserPage() {
  const data = await getData()

  return (
    <>
      <Breadcrumbs pages={pages} />
      <UserTable columns={columns} data={data} />
    </>
  )
}
