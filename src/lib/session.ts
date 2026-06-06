import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

const secretKey = process.env.SESSION_SECRET || "fallback-secret-change-me";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: { userId: number; expiresAt: Date }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as { userId: number; expiresAt: string };
  } catch {
    return null;
  }
}

export async function createSession(userId: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });

  await db.insert(sessions).values({
    userId,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (sessionCookie) {
    const payload = await decrypt(sessionCookie);
    if (payload) {
      await db.delete(sessions).where(eq(sessions.userId, payload.userId));
    }
  }
  cookieStore.delete("session");
}
