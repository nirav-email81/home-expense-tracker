"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const now = new Date();
  const [from, setFrom] = useState(`${now.getFullYear()}-01-01`);
  const [to, setTo] = useState(`${now.getFullYear()}-12-31`);

  const { data } = useQuery<any>({
    queryKey: ["reports", from, to],
    queryFn: () => fetch(`/api/reports?from=${from}&to=${to}`).then((r) => r.json()),
  });

  const expenses = data?.expenses || [];
  const incomes = data?.incomes || [];

  const expensePieData = expenses.map((e: any) => ({
    name: e.categoryName,
    value: Number(e.total),
    color: e.categoryColor || "#888",
  }));

  const incomePieData = incomes.map((e: any) => ({
    name: e.categoryName,
    value: Number(e.total),
    color: e.categoryColor || "#888",
  }));

  const barData = [
    { name: "Income", amount: data?.totalIncomes || 0 },
    { name: "Expenses", amount: data?.totalExpenses || 0 },
  ];

  function exportCSV() {
    const headers = "Category,Amount\n";
    const rows = expenses
      .map((e: any) => `${e.categoryName},${e.total}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-report-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Expense Report", 14, 15);
    doc.text(`Period: ${from} to ${to}`, 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [["Category", "Amount"]],
      body: expenses.map((e: any) => [e.categoryName, formatINR(Number(e.total))]),
    });

    doc.save(`expense-report-${from}-to-${to}.pdf`);
    toast.success("PDF exported");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Visualize and export your finances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <Label>From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Income</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{formatINR(data?.totalIncomes || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Expenses</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{formatINR(data?.totalExpenses || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Net Balance</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${(data?.balance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatINR(data?.balance || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses Breakdown</TabsTrigger>
          <TabsTrigger value="incomes">Income Breakdown</TabsTrigger>
          <TabsTrigger value="comparison">Income vs Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {expensePieData.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No expense data</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={expensePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
                      {expensePieData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incomes" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {incomePieData.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No income data</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={incomePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
                      {incomePieData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="var(--color-primary, #6366f1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
