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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

interface PlannedExpense {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  frequency: string;
  notes: string | null;
}

export default function PlannedExpensesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlannedExpense | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: list } = useQuery<PlannedExpense[]>({
    queryKey: ["planned-expenses"],
    queryFn: () => fetch("/api/planned-expenses").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/planned-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planned-expenses"] });
      setOpen(false);
      toast.success("Planned expense added");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      fetch(`/api/planned-expenses/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planned-expenses"] });
      setOpen(false);
      setEditing(null);
      toast.success("Updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/planned-expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planned-expenses"] });
      toast.success("Deleted");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      amount: Number(form.get("amount")),
      dueDate: form.get("dueDate") as string,
      frequency: form.get("frequency") as string,
      notes: (form.get("notes") as string) || "",
    };
    if (editing) updateMutation.mutate({ ...data, id: editing.id });
    else createMutation.mutate(data);
  }

  const today = new Date();
  const yearEnd = new Date(year, 11, 31);

  const filtered = (list || []).filter((e) => {
    const d = new Date(e.dueDate);
    if (e.frequency === "one_time") {
      return d.getFullYear() === year;
    }
    return true;
  });

  const totalsByFreq = (freq: string) =>
    filtered.filter((e) => e.frequency === freq).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planned Expenses</h2>
          <p className="text-muted-foreground">
            Major expected expenses — insurance, maintenance, big purchases
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />Add Planned Expense</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Planned Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" required placeholder="e.g. Car Insurance" defaultValue={editing?.name} />
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input name="amount" type="number" step="0.01" required defaultValue={editing?.amount} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input name="dueDate" type="date" required defaultValue={editing?.dueDate || format(new Date(), "yyyy-MM-dd")} />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select name="frequency" defaultValue={editing?.frequency || "one_time"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input name="notes" placeholder="Any details" defaultValue={editing?.notes || ""} />
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">One-Time</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR(totalsByFreq("one_time"))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Yearly</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR(totalsByFreq("yearly"))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Planned</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR(filtered.reduce((s, e) => s + e.amount, 0))}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} planned expense{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No planned expenses for {year}</TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => {
                  const d = new Date(e.dueDate);
                  const isUpcoming = isAfter(d, today);
                  const isOverdue = isBefore(d, today);
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>
                        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                          {format(d, "MMM d, yyyy")}
                        </span>
                        {isOverdue && <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>}
                        {isUpcoming && <Badge variant="secondary" className="ml-2 text-xs">Upcoming</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{e.frequency.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {e.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatINR(e.amount)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditing(e); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(e.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
