import { db } from "@/db";
import { categories } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;
  const body = await req.json();

  const result = await db
    .update(categories)
    .set({ name: body.name, icon: body.icon, color: body.color })
    .where(and(eq(categories.id, Number(id)), eq(categories.userId, userId)))
    .returning();

  return Response.json(result[0] || { error: "Not found" }, { status: result[0] ? 200 : 404 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;

  await db
    .delete(categories)
    .where(and(eq(categories.id, Number(id)), eq(categories.userId, userId)));

  return Response.json({ success: true });
}
