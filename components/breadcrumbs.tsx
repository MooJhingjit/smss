import { ChevronRight, LayoutDashboard } from "lucide-react";


type Page = {
  name: string;
  href: string;
  current: boolean;
};

export default function Breadcrumbs(props: { pages: Page[] }) {
  const { pages } = props;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="sr-only">Dashboard</span>
            </a>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRight
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <a
                href={page.href}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={page.current ? "page" : undefined}
              >
                {page.name}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
