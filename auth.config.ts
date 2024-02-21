import { UserRole } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";
import { db } from "./lib/db";
// ref. https://nextjs.org/learn/dashboard-app/adding-authentication

const getUserById = async (id: number) => {
  try {
      const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};

const SIGN_IN_ROUTE = "/sign-in";
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
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    async jwt({ token, session }) {
      // Persist the OAuth access_token to the token right after signin\

      if (!token.sub) return token;

      const existingUser = await getUserById(parseInt(token.sub));

      if (!existingUser) return token;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;

      return token
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
