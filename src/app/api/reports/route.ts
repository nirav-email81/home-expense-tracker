import { db } from "@/db";
import { expenses, incomes, categories, users } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";

export async function GET(req: Request) {
  const { userId } = await verifySession();
  const user = await getUser();
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let userIds = [userId];
  if (user?.familyId) {
    const members = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.familyId, user.familyId));
    userIds = members.map((m) => m.id);
  }

  const userFilter = inArray(expenses.userId, userIds);
  const dateFilter = from && to
    ? and(gte(expenses.date, from), lte(expenses.date, to))
    : undefined;

  const expenseData = await db
    .select({
      categoryId: expenses.categoryId,
      total: sql`SUM(${expenses.amount})`.as("total"),
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(dateFilter ? and(userFilter, dateFilter) : userFilter)
    .groupBy(expenses.categoryId);

  const incomeFilter = inArray(incomes.userId, userIds);
  const incomeDateFilter = from && to
    ? and(gte(incomes.date, from), lte(incomes.date, to))
    : undefined;

  const incomeData = await db
    .select({
      categoryId: incomes.categoryId,
      total: sql`SUM(${incomes.amount})`.as("total"),
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(incomes)
    .leftJoin(categories, eq(incomes.categoryId, categories.id))
    .where(incomeDateFilter ? and(incomeFilter, incomeDateFilter) : incomeFilter)
    .groupBy(incomes.categoryId);

  const totalExpenses = expenseData.reduce((sum, row) => sum + Number(row.total), 0);
  const totalIncomes = incomeData.reduce((sum, row) => sum + Number(row.total), 0);

  return Response.json({
    expenses: expenseData,
    incomes: incomeData,
    totalExpenses,
    totalIncomes,
    balance: totalIncomes - totalExpenses,
  });
}
