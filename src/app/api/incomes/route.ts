import { db } from "@/db";
import { incomes, users } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { desc, asc, eq, inArray, and, gte, lte, count } from "drizzle-orm";

export async function GET(req: Request) {
  const { userId } = await verifySession();
  const user = await getUser();
  const url = new URL(req.url);

  let userIds = [userId];
  if (user?.familyId) {
    const members = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.familyId, user.familyId));
    userIds = members.map((m) => m.id);
  }

  const conditions = [inArray(incomes.userId, userIds)];
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const categoryId = url.searchParams.get("categoryId");

  if (from) conditions.push(gte(incomes.date, from));
  if (to) conditions.push(lte(incomes.date, to));
  if (categoryId) conditions.push(eq(incomes.categoryId, Number(categoryId)));

  const where = and(...conditions);

  const totalResult = await db
    .select({ total: count() })
    .from(incomes)
    .where(where);
  const total = totalResult[0]?.total || 0;

  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const sortBy = url.searchParams.get("sortBy") || "date";
  const sortOrder = url.searchParams.get("sortOrder") === "asc" ? asc : desc;

  const orderBy = {
    date: sortOrder(incomes.date),
    amount: sortOrder(incomes.amount),
    category: sortOrder(incomes.categoryId),
    name: sortOrder(users.name),
  }[sortBy as "date" | "amount" | "category" | "name"] || desc(incomes.date);

  const result = await db
    .select({
      id: incomes.id,
      amount: incomes.amount,
      description: incomes.description,
      date: incomes.date,
      categoryId: incomes.categoryId,
      userId: incomes.userId,
      userName: users.name,
    })
    .from(incomes)
    .leftJoin(users, eq(incomes.userId, users.id))
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return Response.json({ data: result, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const { userId } = await verifySession();
  const user = await getUser();
  const body = await req.json();

  const result = await db
    .insert(incomes)
    .values({
      amount: body.amount,
      description: body.description || "",
      date: body.date,
      categoryId: body.categoryId,
      userId,
      familyId: user?.familyId || null,
    })
    .returning();

  return Response.json(result[0]);
}
