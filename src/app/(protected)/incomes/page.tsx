"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

export default function IncomesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const limit = 15;

  const { data: cats } = useQuery<any[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const { data } = useQuery<{ data: any[]; total: number; totalPages: number }>({
    queryKey: ["incomes", page, sortBy, sortOrder],
    queryFn: () => fetch(`/api/incomes?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`).then((r) => r.json()),
  });

  const incomeCats = cats?.filter((c: any) => c.type === "income") || [];
  const incomes = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/incomes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      setOpen(false);
      toast.success("Income added");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      fetch(`/api/incomes/${data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      setOpen(false);
      setEditing(null);
      toast.success("Income updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/incomes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      toast.success("Income deleted");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      amount: Number(form.get("amount")),
      description: form.get("description") as string,
      date: form.get("date") as string,
      categoryId: Number(form.get("categoryId")),
    };
    if (editing) updateMutation.mutate({ ...data, id: editing.id });
    else createMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Income</h2>
          <p className="text-muted-foreground">Track your earnings</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />Add Income</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Income" : "Add Income"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input name="amount" type="number" step="0.01" required defaultValue={editing?.amount} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input name="description" defaultValue={editing?.description || ""} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input name="date" type="date" required defaultValue={editing?.date || format(new Date(), "yyyy-MM-dd")} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="categoryId" defaultValue={editing?.categoryId?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {incomeCats.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Add"} Income</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-1">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v || "date"); setPage(1); }}>
          <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="name">By</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); setPage(1); }} title={sortOrder === "asc" ? "Ascending" : "Descending"}>
          {sortOrder === "asc" ? "↑" : "↓"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No income entries yet</TableCell>
                </TableRow>
              ) : (
                incomes.map((inc: any) => {
                  const cat = incomeCats.find((c: any) => c.id === inc.categoryId);
                  return (
                    <TableRow key={inc.id}>
                      <TableCell>{format(new Date(inc.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{inc.description || "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          {cat?.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                          {cat?.name || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{inc.userName || "—"}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">{formatINR(inc.amount)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditing(inc); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(inc.id)}>
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

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{data.total} total entries</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />Prev
            </Button>
            <span className="flex items-center text-sm text-muted-foreground px-2">
              Page {page} of {data.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
