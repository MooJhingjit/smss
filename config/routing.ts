import { UserRole } from "@prisma/client";

// only admin can access these routes
export const protectedRoutes = [
    '/purchase-orders',
    "/items",
    "/users",
    "/invoices",
    "/installments",
    "/stats"
]

// Type for navigation link permissions
type Permission = UserRole | "*";

// Type for navigation links
export interface NavigationLink {
    href: string;
    label: string;
    permission: Permission[];
}

// centralized navigation links configuration
export const navigationLinks: NavigationLink[] = [
    { href: "/quotations", label: "Quotations", permission: ["*"] },
    {
        href: "/purchase-orders",
        label: "Purchase Orders",
        permission: ["admin"],
    },
    // { href: "/installments", label: "Installments", permission: ["admin"] },
    {
        href: "/invoices",
        label: "Invoices",
        permission: ["admin"],
    },
    { href: "/products", label: "Products/Services", permission: ["*"] },
    { href: "/items", label: "Stock", permission: ["admin"] },
    { href: "/contacts", label: "Customers", permission: ["*"] },
    { href: "/users", label: "Users", permission: ["admin"] },
];

// helper function to filter links based on user role
export const getFilteredLinks = (userRole: UserRole): NavigationLink[] => {
    return navigationLinks.filter(
        (link) =>
            link.permission.includes(userRole) || link.permission.includes("*")
    );
};