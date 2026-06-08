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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

export default function RecurringPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: cats } = useQuery<any[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const { data: recurring } = useQuery<any[]>({
    queryKey: ["recurring"],
    queryFn: () => fetch("/api/recurring").then((r) => r.json()),
  });

  const expenseCats = cats?.filter((c: any) => c.type === "expense") || [];

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      setOpen(false);
      toast.success("Recurring expense added");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      fetch(`/api/recurring/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      toast.success("Updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/recurring/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      toast.success("Recurring expense deleted");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      amount: Number(form.get("amount")),
      description: form.get("description") as string,
      categoryId: Number(form.get("categoryId")),
      frequency: form.get("frequency") as string,
      nextDate: form.get("nextDate") as string,
    };

    if (editing) {
      updateMutation.mutate({ ...data, id: editing.id, active: editing.active });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Recurring Expenses</h2>
          <p className="text-muted-foreground">Manage subscriptions and recurring bills</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />Add Recurring</Button>} />
          <DialogContent key={editing?.id ?? "new"}>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Recurring Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input name="amount" type="number" step="0.01" required defaultValue={editing?.amount} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input name="description" defaultValue={editing?.description || ""} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="categoryId" defaultValue={editing?.categoryId?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {expenseCats.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select name="frequency" defaultValue={editing?.frequency || "monthly"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Next Date</Label>
                <Input name="nextDate" type="date" required defaultValue={editing?.nextDate || format(new Date(), "yyyy-MM-dd")} />
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurring?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No recurring expenses</TableCell>
                </TableRow>
              )}
              {recurring?.map((r: any) => {
                const cat = expenseCats.find((c: any) => c.id === r.categoryId);
                return (
                  <TableRow key={r.id}>
                    <TableCell>{r.description || "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        {cat?.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                        {cat?.name}
                      </span>
                    </TableCell>
                    <TableCell><Badge variant="outline">{r.frequency}</Badge></TableCell>
                    <TableCell>{format(new Date(r.nextDate), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right font-medium">{formatINR(r.amount)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={r.active}
                        onCheckedChange={(v) => updateMutation.mutate({ ...r, active: v })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
