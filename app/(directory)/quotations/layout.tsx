import MainNavbar from '@/components/navbar'

type Props = {
  children: React.ReactNode;
};

export default function DirectoryLayout(props: Props) {
  const { children } = props;
  return (
    <div className="h-full ">
      <MainNavbar showMenu/>
      <div className="pt-28 pb-20">{children}</div>
    </div>
  );
}
