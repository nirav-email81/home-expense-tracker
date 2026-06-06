import { db } from "@/db";
import { plannedExpenses } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;
  const body = await req.json();

  const result = await db
    .update(plannedExpenses)
    .set({
      name: body.name,
      amount: body.amount,
      dueDate: body.dueDate,
      frequency: body.frequency,
      notes: body.notes,
    })
    .where(and(eq(plannedExpenses.id, Number(id)), eq(plannedExpenses.userId, userId)))
    .returning() as any[];

  return Response.json(result[0] || { error: "Not found" }, { status: result[0] ? 200 : 404 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;

  await db
    .delete(plannedExpenses)
    .where(and(eq(plannedExpenses.id, Number(id)), eq(plannedExpenses.userId, userId)));

  return Response.json({ success: true });
}
