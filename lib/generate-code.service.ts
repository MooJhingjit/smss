import { db } from "@/lib/db";

export const generateBillGroupCode = async (BILL_GROUP_DATE: Date) => {
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

  return code;
};
