"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

type ModelName = Uncapitalize<Prisma.ModelName>;

type UpdateAndLogParams<T extends ModelName> = {
  model: T;
  where: Parameters<(typeof db)[T]["update"]>[0]["where"];
  data: Parameters<(typeof db)[T]["update"]>[0]["data"];
};

export const updateAndLog = async <T extends ModelName>({ model, where, data }: UpdateAndLogParams<T>) => {
  try {
    const before = await (db[model] as any).findUnique({ where });

    if (!before) {
      // If the record doesn't exist, we probably shouldn't proceed.
      // Or, just perform the update without logging. For now, let's just update.
      return await (db[model] as any).update({ where, data });
    }

    const after = await (db[model] as any).update({ where, data });

    const user = await currentUser();
    const userId = user?.id ? parseInt(user.id, 10) : null;

    const getDiff = (before: any, after: any) => {
      const diff: any = {};
      const excludedFields = ["createdAt", "updatedAt", "offeredAt", "paymentDue"];
      for (const key in after) {
        if (Object.prototype.hasOwnProperty.call(after, key) && !excludedFields.includes(key)) {
          if (!Object.prototype.hasOwnProperty.call(before, key) || before[key] !== after[key]) {
            diff[key] = { before: before ? before[key] : null, after: after[key] };
          }
        }
      }
      // aa
      return Object.keys(diff).length > 0 ? diff : null;
    };

    // Calculate the difference between before and after
    const diff = getDiff(before, after);

    if (diff) {
      await db.auditLog.create({
        data: {
          userId,
          model: (model as string).charAt(0).toUpperCase() + (model as string).slice(1), // Capitalize model name
          action: "update",
          recordId: (after as any).id.toString(),
          diff,
        },
      });
    }

    return after;
  } catch (error) {
    console.error("Failed to update and log:", error);
    // To avoid breaking the main flow, we can re-throw or just return null/undefined
    // For now, re-throwing to make it visible something went wrong.
    // In production, you might want to just log the error and not re-throw.
    throw error;
  }
};

