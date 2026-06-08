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
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Filter, X, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

interface Category {
  id: number;
  name: string;
  type: string;
  color: string | null;
}

interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
  userName?: string | null;
}

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const limit = 15;

  const { data: cats } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), sortBy, sortOrder });
  if (search) queryParams.set("search", search);
  Object.entries(filters).forEach(([k, v]) => { if (v) queryParams.set(k, v); });

  const { data } = useQuery<{ data: Expense[]; total: number; totalPages: number }>({
    queryKey: ["expenses", page, search, filters, sortBy, sortOrder],
    queryFn: () => fetch(`/api/expenses?${queryParams}`).then((r) => r.json()),
  });

  const expenseCats = cats?.filter((c) => c.type === "expense") || [];
  const expenses = data?.data || [];

  const setFilter = (key: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value || "" }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
    setSearch("");
  };

  const createMutation = useMutation({
    mutationFn: (data: Partial<Expense>) =>
      fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      toast.success("Expense added");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Expense) =>
      fetch(`/api/expenses/${data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      setEditing(null);
      toast.success("Expense updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted");
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
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Manage your expenses</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />Add Expense</Button>} />
          <DialogContent key={editing?.id ?? "new"}>
            <DialogHeader><DialogTitle>{editing ? "Edit Expense" : "Add Expense"}</DialogTitle></DialogHeader>
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
                    {expenseCats.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Add"} Expense</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />Filters
        </Button>
        {(Object.keys(filters).length > 0 || search) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={filters.from || ""} onChange={(e) => setFilter("from", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="date" value={filters.to || ""} onChange={(e) => setFilter("to", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={filters.categoryId || ""} onValueChange={(v) => setFilter("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    {expenseCats.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min</Label>
                <Input type="number" placeholder="Min ₹" value={filters.minAmount || ""} onChange={(e) => setFilter("minAmount", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No expenses found</TableCell>
                </TableRow>
              ) : (
                expenses.map((exp) => {
                  const cat = expenseCats.find((c) => c.id === exp.categoryId);
                  return (
                    <TableRow key={exp.id}>
                      <TableCell>{format(new Date(exp.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{exp.description || "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          {cat?.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                          {cat?.name || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{exp.userName || "—"}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{formatINR(exp.amount)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditing(exp); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(exp.id)}>
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
          <p className="text-sm text-muted-foreground">{data.total} total expenses</p>
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
