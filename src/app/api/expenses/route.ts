import { db } from "@/db";
import { expenses, users } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { desc, asc, eq, inArray, and, gte, lte, sql, count } from "drizzle-orm";

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

  const conditions = [inArray(expenses.userId, userIds)];

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const categoryId = url.searchParams.get("categoryId");
  const minAmount = url.searchParams.get("minAmount");
  const maxAmount = url.searchParams.get("maxAmount");
  const search = url.searchParams.get("search");

  if (from) conditions.push(gte(expenses.date, from));
  if (to) conditions.push(lte(expenses.date, to));
  if (categoryId) conditions.push(eq(expenses.categoryId, Number(categoryId)));
  if (minAmount) conditions.push(gte(expenses.amount, Number(minAmount)));
  if (maxAmount) conditions.push(lte(expenses.amount, Number(maxAmount)));
  if (search) conditions.push(sql`LOWER(${expenses.description}) LIKE ${`%${search.toLowerCase()}%`}`);

  const where = and(...conditions);

  const totalResult = await db
    .select({ total: count() })
    .from(expenses)
    .where(where);
  const total = totalResult[0]?.total || 0;

  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const sortBy = url.searchParams.get("sortBy") || "date";
  const sortOrder = url.searchParams.get("sortOrder") === "asc" ? asc : desc;

  const orderBy = {
    date: sortOrder(expenses.date),
    amount: sortOrder(expenses.amount),
    category: sortOrder(expenses.categoryId),
    name: sortOrder(users.name),
  }[sortBy as "date" | "amount" | "category" | "name"] || desc(expenses.date);

  const result = await db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      categoryId: expenses.categoryId,
      userId: expenses.userId,
      userName: users.name,
    })
    .from(expenses)
    .leftJoin(users, eq(expenses.userId, users.id))
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
    .insert(expenses)
    .values({
      amount: body.amount,
      description: body.description || "",
      date: body.date,
      categoryId: body.categoryId,
      userId,
      familyId: user?.familyId || null,
      receiptUrl: body.receiptUrl || null,
    })
    .returning();

  return Response.json(result[0]);
}
