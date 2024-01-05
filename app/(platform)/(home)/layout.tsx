import MainNavbar from '@/components/navbar'

type Props = {
  children: React.ReactNode;
};

export default function HomeLayout(props: Props) {
  const { children } = props;
  return (
    <div className="bg-gradient-to-tl from-transparent via-blue-300 to-blue-500">
      <MainNavbar/>
      <div className="pt-20 pb-20">{children}</div>
    </div>
  );
}
