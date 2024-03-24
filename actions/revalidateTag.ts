"use server";

import { revalidatePath } from "next/cache";

export const customRevalidatePath = (path: string) => {
  revalidatePath(path);
};
