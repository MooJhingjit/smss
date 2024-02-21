import type { NextAuthConfig } from 'next-auth';
// ref. https://nextjs.org/learn/dashboard-app/adding-authentication

const SIGN_IN_ROUTE = '/sign-in';
export const authConfig = {
  pages: {
    signIn: SIGN_IN_ROUTE,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname !== SIGN_IN_ROUTE;
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;