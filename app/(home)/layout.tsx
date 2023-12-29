import MainNavbar from '@/components/navbar'

type Props = {
  children: React.ReactNode;
};

export default function HomeLayout(props: Props) {
  const { children } = props;
  return (
    <div className="h-full bg-gradient-to-tl from-transparent via-blue-300 to-blue-500 overflow-y-scroll">
      <MainNavbar/>
      <div className="pt-28 pb-20">{children}</div>
    </div>
  );
}
