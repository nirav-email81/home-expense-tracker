import { db } from "@/db";
import { investments, families } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { desc, eq } from "drizzle-orm";

async function checkOwner() {
  const user = await getUser();
  const { userId } = await verifySession();
  if (!user?.familyId) return { userId };
  const family = await db.select().from(families).where(eq(families.id, user.familyId));
  if (family[0].ownerId !== userId) return null;
  return { userId, familyId: user.familyId };
}

export async function GET() {
  const ctx = await checkOwner();
  if (!ctx) return Response.json({ error: "Only the family owner can access investments" }, { status: 403 });

  const result = await db
    .select()
    .from(investments)
    .where(eq(investments.userId, ctx.userId))
    .orderBy(desc(investments.createdAt));

  return Response.json(result);
}

export async function POST(req: Request) {
  const ctx = await checkOwner();
  if (!ctx) return Response.json({ error: "Only the family owner can access investments" }, { status: 403 });

  const body = await req.json();

  const result = await db
    .insert(investments)
    .values({
      name: body.name,
      type: body.type,
      amount: body.amount,
      quantity: body.quantity || null,
      purchaseDate: body.purchaseDate,
      notes: body.notes || "",
      userId: ctx.userId,
      familyId: ctx.familyId || null,
    })
    .returning() as any[];

  return Response.json(result[0]);
}
