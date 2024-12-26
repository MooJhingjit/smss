"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { billGroupId, newQuotationId, currentQuotationId } = data;

    let billGroupIdToUse = billGroupId;
    let invoice;
    if (!billGroupIdToUse) {
      const billGroup = await db.billGroup.create({
        data: {
          code: "", 
          date: new Date(),
        },
      });
      billGroupIdToUse = billGroup.id;

      // first time create bill group, attach current quotation to it and create invoice
      await db.quotation.update({
        where: { id: currentQuotationId },
        data: { billGroupId: billGroupIdToUse },
      });

    }

    // attach new quotation to the same bill group
    if (newQuotationId && newQuotationId !== currentQuotationId) {
      await db.quotation.update({
        where: { id: newQuotationId },
        data: { billGroupId: billGroupIdToUse },
      });
    }

    revalidatePath("/quotations/[id]");

    // return latest invoice
    return { data: invoice };
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }
};

export const attachQuotationToBillGroup = createSafeAction(schema, handler);
