import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession(user.id);

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
