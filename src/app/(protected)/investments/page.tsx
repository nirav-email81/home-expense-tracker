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
import { Plus, Pencil, Trash2, Landmark, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

const typeLabels: Record<string, string> = {
  deposit: "Bank Deposit",
  mutual_fund: "Mutual Fund",
  gold: "Gold",
  art: "Art",
  other: "Other",
};

const typeColors: Record<string, string> = {
  deposit: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  mutual_fund: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  art: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

export default function InvestmentsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: list, isLoading } = useQuery<any[]>({
    queryKey: ["investments"],
    queryFn: () => fetch("/api/investments").then(async (r) => {
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      return r.json();
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      setOpen(false);
      toast.success("Investment added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      fetch(`/api/investments/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      setOpen(false);
      setEditing(null);
      toast.success("Investment updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/investments/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast.success("Investment deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      type: form.get("type") as string,
      amount: Number(form.get("amount")),
      quantity: form.get("quantity") ? Number(form.get("quantity")) : null,
      purchaseDate: form.get("purchaseDate") as string,
      notes: (form.get("notes") as string) || "",
    };
    if (editing) updateMutation.mutate({ ...data, id: editing.id });
    else createMutation.mutate(data);
  }

  const totalValue = (list || []).reduce((s: number, i: any) => s + i.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Investments</h2>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!list && !isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Investments</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Access Restricted</h3>
            <p className="text-sm text-muted-foreground text-center">
              Only the family owner can access the Investments section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Investments</h2>
          <p className="text-muted-foreground">Track bank deposits, mutual funds, gold, art & more</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />Add Investment</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Investment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" required placeholder="e.g. SBI FD, HDFC Mutual Fund" defaultValue={editing?.name} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select name="type" defaultValue={editing?.type || "deposit"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Bank Deposit</SelectItem>
                    <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input name="amount" type="number" step="0.01" required defaultValue={editing?.amount} />
              </div>
              <div className="space-y-2">
                <Label>Quantity / Units (optional)</Label>
                <Input name="quantity" type="number" step="any" placeholder="e.g. 10g gold, 500 units" defaultValue={editing?.quantity || ""} />
              </div>
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input name="purchaseDate" type="date" required defaultValue={editing?.purchaseDate || format(new Date(), "yyyy-MM-dd")} />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input name="notes" placeholder="Provider, account number, etc." defaultValue={editing?.notes || ""} />
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Add"} Investment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Deposits</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR((list || []).filter((i: any) => i.type === "deposit").reduce((s: number, i: any) => s + i.amount, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Mutual Funds</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR((list || []).filter((i: any) => i.type === "mutual_fund").reduce((s: number, i: any) => s + i.amount, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Gold / Art</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR((list || []).filter((i: any) => ["gold", "art"].includes(i.type)).reduce((s: number, i: any) => s + i.amount, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatINR(totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No investments recorded</TableCell>
                </TableRow>
              ) : (
                list?.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.name}</TableCell>
                    <TableCell>
                      <Badge className={typeColors[inv.type] || ""} variant="outline">
                        {typeLabels[inv.type] || inv.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(inv.purchaseDate), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right font-medium">{formatINR(inv.amount)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{inv.quantity ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                      {inv.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(inv); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(inv.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
