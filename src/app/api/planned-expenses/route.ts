import { db } from "@/db";
import { plannedExpenses, users } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { desc, eq, inArray } from "drizzle-orm";

export async function GET() {
  const { userId } = await verifySession();
  const user = await getUser();

  let userIds = [userId];
  if (user?.familyId) {
    const members = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.familyId, user.familyId));
    userIds = members.map((m) => m.id);
  }

  const result = await db
    .select()
    .from(plannedExpenses)
    .where(inArray(plannedExpenses.userId, userIds))
    .orderBy(desc(plannedExpenses.createdAt));

  return Response.json(result);
}

export async function POST(req: Request) {
  const { userId } = await verifySession();
  const user = await getUser();
  const body = await req.json();

  const result = await db
    .insert(plannedExpenses)
    .values({
      name: body.name,
      amount: body.amount,
      dueDate: body.dueDate,
      frequency: body.frequency || "one_time",
      notes: body.notes || "",
      userId,
      familyId: user?.familyId || null,
    })
    .returning() as any[];

  return Response.json(result[0]);
}
