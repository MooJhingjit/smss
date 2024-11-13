"use client"
import { useSession } from "next-auth/react";

export const useIsAdmin = () => {
  const session = useSession();
  // console.log(session)
  return session.data?.user?.role === "admin";

};
