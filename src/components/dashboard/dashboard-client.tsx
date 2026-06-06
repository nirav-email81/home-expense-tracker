"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
  userId?: number;
  userName?: string | null;
}

interface MonthData {
  month: string;
  expenses: number;
  incomes: number;
}

export function DashboardClient({
  monthlyExpenses,
  monthlyIncomes,
  recentExpenses,
  familyName,
  comparison,
}: {
  monthlyExpenses: number;
  monthlyIncomes: number;
  recentExpenses: Expense[];
  familyName?: string;
  comparison?: MonthData[];
}) {
  const balance = monthlyIncomes - monthlyExpenses;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {familyName
            ? `${familyName} financial overview for this month`
            : "Your financial overview for this month"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatINR(monthlyIncomes)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatINR(monthlyExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatINR(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <p className="text-muted-foreground text-sm">No expenses yet. <Link href="/expenses" className="text-primary underline">Add one</Link></p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{exp.description || "No description"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(exp.date), "MMM d, yyyy")}
                      {exp.userName && <span className="ml-2 text-muted-foreground/60">by {exp.userName}</span>}
                    </p>
                  </div>
                  <span className="font-semibold text-red-600">-{formatINR(exp.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {comparison && comparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} />
                  <Legend />
                  <Bar dataKey="incomes" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
