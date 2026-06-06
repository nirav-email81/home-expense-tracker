import { db } from "@/db";
import { families, users } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { userId } = await verifySession();
  const body = await req.json();

  const result = await db
    .insert(families)
    .values({ name: body.name, ownerId: userId })
    .returning() as any[];

  await db
    .update(users)
    .set({ familyId: result[0].id })
    .where(eq(users.id, userId));

  return Response.json(result[0] as any);
}

export async function PUT(req: Request) {
  const { userId } = await verifySession();
  const user = await getUser();
  if (!user?.familyId) {
    return Response.json({ error: "Not in a family" }, { status: 400 });
  }

  const family = await db.select().from(families).where(eq(families.id, user.familyId));
  if (family[0].ownerId !== userId) {
    return Response.json({ error: "Only the family owner can rename" }, { status: 403 });
  }

  const body = await req.json();
  const result = await db
    .update(families)
    .set({ name: body.name })
    .where(eq(families.id, user.familyId))
    .returning() as any[];

  return Response.json(result[0]);
}

export async function GET() {
  const { userId } = await verifySession();
  const user = await getUser();
  if (!user?.familyId) {
    return Response.json(null);
  }

  const family = await db
    .select()
    .from(families)
    .where(eq(families.id, user.familyId));

  const members = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.familyId, user.familyId));

  return Response.json({ ...family[0], members, isOwner: family[0].ownerId === userId });
}
