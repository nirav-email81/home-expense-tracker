import { db } from "@/db";
import { investments, families } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { eq, and } from "drizzle-orm";

async function checkOwner() {
  const user = await getUser();
  const { userId } = await verifySession();
  if (!user?.familyId) return { userId };
  const family = await db.select().from(families).where(eq(families.id, user.familyId));
  if (family[0].ownerId !== userId) return null;
  return { userId, familyId: user.familyId };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await checkOwner();
  if (!ctx) return Response.json({ error: "Only the family owner can access investments" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const result = await db
    .update(investments)
    .set({
      name: body.name,
      type: body.type,
      amount: body.amount,
      quantity: body.quantity,
      purchaseDate: body.purchaseDate,
      notes: body.notes,
    })
    .where(and(eq(investments.id, Number(id)), eq(investments.userId, ctx.userId)))
    .returning() as any[];

  return Response.json(result[0] || { error: "Not found" }, { status: result[0] ? 200 : 404 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await checkOwner();
  if (!ctx) return Response.json({ error: "Only the family owner can access investments" }, { status: 403 });

  const { id } = await params;

  await db
    .delete(investments)
    .where(and(eq(investments.id, Number(id)), eq(investments.userId, ctx.userId)));

  return Response.json({ success: true });
}
