import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const distinct = searchParams.get("distinct");
  const model = searchParams.get("model");

  try {
    if (distinct === "model") {
      const models = await db.auditLog.findMany({
        select: {
          model: true,
        },
        distinct: ["model"],
        orderBy: {
          model: "asc",
        },
      });
      const modelNames = models.map((m) => m.model);
      return NextResponse.json(modelNames);
    }

    if (model) {
      const logs = await db.auditLog.findMany({
        where: {
          model,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(logs);
    }

    return new NextResponse("Bad Request", { status: 400 });
  } catch (error) {
    console.error("[LOGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
