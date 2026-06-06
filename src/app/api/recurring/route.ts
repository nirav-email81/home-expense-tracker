import { db } from "@/db";
import { recurringExpenses } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await verifySession();
  const result = await db
    .select()
    .from(recurringExpenses)
    .where(eq(recurringExpenses.userId, userId))
    .orderBy(desc(recurringExpenses.createdAt));
  return Response.json(result);
}

export async function POST(req: Request) {
  const { userId } = await verifySession();
  const user = await getUser();
  const body = await req.json();

  const result = await db
    .insert(recurringExpenses)
    .values({
      amount: body.amount,
      description: body.description || "",
      categoryId: body.categoryId,
      frequency: body.frequency,
      nextDate: body.nextDate,
      userId,
      familyId: user?.familyId || null,
    })
    .returning();

  return Response.json(result[0]);
}
