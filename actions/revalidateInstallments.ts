"use server";

import { revalidatePath } from "next/cache";

export async function revalidateInstallmentsPage(quotationId: number) {
  try {
    revalidatePath(`/installments/${quotationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error revalidating installments page:", error);
    return { success: false, error: "Failed to revalidate page" };
  }
}
