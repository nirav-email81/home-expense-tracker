import { db } from "@/db";
import { users, families } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { userId } = await verifySession();
  const currentUser = await getUser();

  if (!currentUser?.familyId) {
    return Response.json({ error: "You must be in a family to add members" }, { status: 400 });
  }

  const family = await db.select().from(families).where(eq(families.id, currentUser.familyId));
  if (family[0].ownerId !== userId) {
    return Response.json({ error: "Only the family owner can add members" }, { status: 403 });
  }

  const { email, name, password } = await req.json();

  if (!email || !name || !password) {
    return Response.json({ error: "Email, name, and password are required" }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return Response.json({ error: "A user with that email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      familyId: currentUser.familyId,
    })
    .returning() as any[];

  return Response.json({ success: true, member: { id: result[0].id, name: result[0].name, email: result[0].email } });
}
