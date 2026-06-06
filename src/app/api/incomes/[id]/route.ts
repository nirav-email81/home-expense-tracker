import { db } from "@/db";
import { incomes } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;
  const body = await req.json();

  const result = await db
    .update(incomes)
    .set({
      amount: body.amount,
      description: body.description,
      date: body.date,
      categoryId: body.categoryId,
    })
    .where(and(eq(incomes.id, Number(id)), eq(incomes.userId, userId)))
    .returning();

  return Response.json(result[0] || { error: "Not found" }, { status: result[0] ? 200 : 404 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;

  await db
    .delete(incomes)
    .where(and(eq(incomes.id, Number(id)), eq(incomes.userId, userId)));

  return Response.json({ success: true });
}
