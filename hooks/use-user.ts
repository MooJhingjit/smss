"use server";
import { auth } from "@/auth";

export const useUser = async () => {
  const session = await auth();

  return {
    isAdmin: session?.user?.role === "admin",
    isSeller: session?.user?.role === "seller",
    info: session?.user,
  };
};

// export const isSeller = async () => {
//   const session = await auth();

//   return session?.user?.role === "seller";
// };
// export const isAdmin = async () => {
//   const session = await auth();

//   return session?.user?.role === "admin";
// };
