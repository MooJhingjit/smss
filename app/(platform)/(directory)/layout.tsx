import MainNavbar from "@/components/navbar";

type Props = {
  children: React.ReactNode;
};

export default function HomeLayout(props: Props) {
  const { children } = props;
  return (
    <div className="">
      <MainNavbar withNavigation />
      <div className="pt-20  mx-auto  px-2 xl:px-10 ">
        <div className="">{children}</div>
      </div>
    </div>
  );
}
