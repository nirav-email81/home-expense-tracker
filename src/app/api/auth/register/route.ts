import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .insert(users)
      .values({ name, email, password: hashedPassword })
      .returning({ id: users.id });

    await createSession(result[0].id);

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
