import { ChevronRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import React from "react";

type Page = {
  name: string;
  href: string;
  current: boolean;
  render?: () => React.ReactNode;
};

export default function Breadcrumbs(props: { pages: Page[] }) {
  const { pages } = props;

  const getValue = (page: Page) => {
    if (page.render) {
      return page.render();
    }
    return page.name;
  }
  
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link href="/" className="text-gray-400 hover:text-gray-500">
              <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRight
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {page.current ? (
                <p
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  aria-current="page"
                >
                  {getValue(page)}
                </p>
              ) : (
                <a
                  href={page.href}
                  className="ml-4 text-sm font-medium text-gray-400 hover:text-gray-700"
                  aria-current={page.current ? "page" : undefined}
                >
                  {getValue(page)}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
