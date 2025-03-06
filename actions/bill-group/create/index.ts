"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateCode } from "@/lib/utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { billGroupId, newQuotationId, currentQuotationId, billGroupDate } = data;

    let billGroupIdToUse = billGroupId;
    let invoice;

    // create a new bill group
    if (!billGroupIdToUse) {
      const BILL_GROUP_DATE = new Date(billGroupDate);
      const createdBillGroup = await db.billGroup.create({
        data: {
          code: "",
          date: BILL_GROUP_DATE,
        },
      });
      billGroupIdToUse = createdBillGroup.id;

      // first time create bill group, attach current quotation to it and create invoice
      await db.quotation.update({
        where: { id: currentQuotationId },
        data: { billGroupId: billGroupIdToUse },
      });

      // update bill group code

      const year = BILL_GROUP_DATE.getFullYear();
      const month = (BILL_GROUP_DATE.getMonth() + 1).toString().padStart(2, "0");

      const datePrefix = `${year}-${month}`;
      const lastBillGroup = await db.billGroup.findFirst({
        where: {
          code: {
            startsWith: datePrefix,
          },
        },
        orderBy: {
          code: "desc",
        },
      });

      // 2) Parse the last 3 digits to figure out the sequence number
      let nextSequence = 1;
      if (lastBillGroup?.code) {
        nextSequence = parseInt(lastBillGroup.code.slice(-3), 10) + 1;
      }

      // update code based on quotation ID
      // format: YYYY-MM001
      const code = `${datePrefix}${nextSequence.toString().padStart(3, "0")}`;

      await db.billGroup.update({
        where: { id: billGroupIdToUse },
        data: { code },
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
