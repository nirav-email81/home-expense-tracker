import { db } from "@/db";
import { categories } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { eq, or, isNull } from "drizzle-orm";

export async function GET() {
  const { userId } = await verifySession();
  const user = await getUser();

  const result = await db
    .select()
    .from(categories)
    .where(
      or(
        isNull(categories.userId),
        eq(categories.userId, userId),
        user?.familyId ? eq(categories.familyId, user.familyId) : undefined
      )
    )
    .orderBy(categories.type, categories.name);

  return Response.json(result);
}

export async function POST(req: Request) {
  const { userId } = await verifySession();
  const body = await req.json();

  const result = await db
    .insert(categories)
    .values({
      name: body.name,
      type: body.type,
      icon: body.icon || null,
      color: body.color || null,
      userId,
      familyId: body.familyId || null,
    })
    .returning();

  return Response.json(result[0]);
}
