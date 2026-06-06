import { db } from "@/db";
import { budgets } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  const { userId } = await verifySession();
  const url = new URL(req.url);
  const month = Number(url.searchParams.get("month"));
  const year = Number(url.searchParams.get("year"));

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  const result = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.month, targetMonth),
        eq(budgets.year, targetYear)
      )
    );

  return Response.json(result);
}

export async function POST(req: Request) {
  const { userId } = await verifySession();
  const body = await req.json();

  const existing = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.categoryId, body.categoryId),
        eq(budgets.month, body.month),
        eq(budgets.year, body.year)
      )
    );

  if (existing.length > 0) {
    const result = await db
      .update(budgets)
      .set({ amount: body.amount })
      .where(eq(budgets.id, existing[0].id))
      .returning();
    return Response.json(result[0]);
  }

  const result = await db
    .insert(budgets)
    .values({
      categoryId: body.categoryId,
      amount: body.amount,
      month: body.month,
      year: body.year,
      userId,
    })
    .returning();

  return Response.json(result[0]);
}
