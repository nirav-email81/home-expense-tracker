"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: cats } = useQuery<any[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const { data: budgets } = useQuery<any[]>({
    queryKey: ["budgets", month, year],
    queryFn: () => fetch(`/api/budgets?month=${month}&year=${year}`).then((r) => r.json()),
  });

  const { data: expensesRes } = useQuery<any>({
    queryKey: ["expenses"],
    queryFn: () => fetch("/api/expenses").then((r) => r.json()),
  });
  const expenses = expensesRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setOpen(false);
      toast.success("Budget set");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/budgets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget removed");
    },
  });

  const expenseCats = cats?.filter((c: any) => c.type === "expense") || [];

  function getSpent(categoryId: number) {
    return (expenses || [])
      .filter((e: any) => {
        const d = new Date(e.date);
        return e.categoryId === categoryId && d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum: number, e: any) => sum + e.amount, 0);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      categoryId: Number(form.get("categoryId")),
      amount: Number(form.get("amount")),
      month,
      year,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">Set monthly spending limits</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-20" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />Set Budget</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Set Budget</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select name="categoryId">
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {expenseCats.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input name="amount" type="number" step="0.01" required />
                </div>
                <Button type="submit" className="w-full">Set Budget</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets?.map((budget: any) => {
          const cat = expenseCats.find((c: any) => c.id === budget.categoryId);
          const spent = getSpent(budget.categoryId);
          const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const isOver = spent > budget.amount;

          return (
            <Card key={budget.id} className={isOver ? "border-red-500" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {cat?.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                    {cat?.name || "Unknown"}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(budget.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{formatINR(spent)} spent</span>
                    <span className="text-muted-foreground">of {formatINR(budget.amount)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  {isOver && <p className="text-xs text-red-500 font-medium">Over budget by {formatINR(spent - budget.amount)}</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {budgets?.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">No budgets set for this month</p>
        )}
      </div>
    </div>
  );
}
