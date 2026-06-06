import { db } from "@/db";
import { expenses, incomes, users } from "@/db/schema";
import { verifySession, getUser } from "@/lib/dal";
import { eq, desc, inArray, sql } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const { userId } = await verifySession();
  const user = await getUser();

  let userIds = [userId];
  if (user?.familyId) {
    const members = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.familyId, user.familyId));
    userIds = members.map((m) => m.id);
  }

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
  const lastYear = thisMonth === 1 ? thisYear - 1 : thisYear;

  const mkFirst = (m: number, y: number) => `${y}-${String(m).padStart(2, "0")}-01`;
  const mkLast = (m: number, y: number) => `${y}-${String(m).padStart(2, "0")}-${new Date(y, m, 0).getDate()}`;

  const thisFirst = mkFirst(thisMonth, thisYear);
  const thisLast = mkLast(thisMonth, thisYear);
  const lastFirst = mkFirst(lastMonth, lastYear);
  const lastLast = mkLast(lastMonth, lastYear);

  async function monthTotals(first: string, last: string) {
    const [exp, inc] = await Promise.all([
      db.select({ total: sql`COALESCE(SUM(${expenses.amount}), 0)`.as("total") })
        .from(expenses)
        .where(inArray(expenses.userId, userIds) && sql`${expenses.date} >= ${first} AND ${expenses.date} <= ${last}`),
      db.select({ total: sql`COALESCE(SUM(${incomes.amount}), 0)`.as("total") })
        .from(incomes)
        .where(inArray(incomes.userId, userIds) && sql`${incomes.date} >= ${first} AND ${incomes.date} <= ${last}`),
    ]);
    return { expenses: Number(exp[0]?.total || 0), incomes: Number(inc[0]?.total || 0) };
  }

  const [thisMonthData, lastMonthData, recentExpenses] = await Promise.all([
    monthTotals(thisFirst, thisLast),
    monthTotals(lastFirst, lastLast),
    db
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
      .where(inArray(expenses.userId, userIds))
      .orderBy(desc(expenses.date))
      .limit(5),
  ]);

  const monthLabel = (m: number) => new Date(2000, m - 1).toLocaleString("default", { month: "short" });

  return (
    <DashboardClient
      monthlyExpenses={thisMonthData.expenses}
      monthlyIncomes={thisMonthData.incomes}
      recentExpenses={recentExpenses}
      familyName={user?.familyId ? "Family" : undefined}
      comparison={[
        { month: `${monthLabel(lastMonth)} ${lastYear}`, expenses: lastMonthData.expenses, incomes: lastMonthData.incomes },
        { month: `${monthLabel(thisMonth)} ${thisYear}`, expenses: thisMonthData.expenses, incomes: thisMonthData.incomes },
      ]}
    />
  );
}
