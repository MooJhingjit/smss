import MainNavbar from "@/components/navbar";

type Props = {
  children: React.ReactNode;
};

export default function HomeLayout(props: Props) {
  const { children } = props;
  return (
    <div className="h-screen bg-gray-50">
      <div className="relative">
        <MainNavbar withNavigation/>
      </div>
      <div className="pt-24">{children}</div>
    </div>
  );
}
