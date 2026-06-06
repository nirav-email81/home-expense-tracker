import { db } from "@/db";
import { recurringExpenses } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;
  const body = await req.json();

  const result = await db
    .update(recurringExpenses)
    .set({
      amount: body.amount,
      description: body.description,
      categoryId: body.categoryId,
      frequency: body.frequency,
      nextDate: body.nextDate,
      active: body.active,
    })
    .where(and(eq(recurringExpenses.id, Number(id)), eq(recurringExpenses.userId, userId)))
    .returning();

  return Response.json(result[0] || { error: "Not found" }, { status: result[0] ? 200 : 404 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;

  await db
    .delete(recurringExpenses)
    .where(and(eq(recurringExpenses.id, Number(id)), eq(recurringExpenses.userId, userId)));

  return Response.json({ success: true });
}
