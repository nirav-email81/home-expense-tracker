import { db } from "@/db";
import { budgets } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;

  await db
    .delete(budgets)
    .where(and(eq(budgets.id, Number(id)), eq(budgets.userId, userId)));

  return Response.json({ success: true });
}
