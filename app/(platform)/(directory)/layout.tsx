import MainNavbar from "@/components/navbar";

type Props = {
  children: React.ReactNode;
};

export default function HomeLayout(props: Props) {
  const { children } = props;
  return (
    <div className="">
      <MainNavbar showMenu />
      <div className="pt-20 pb-20 mx-auto max-w-6xl">
        <div className="">{children}</div>
      </div>
    </div>
  );
}
