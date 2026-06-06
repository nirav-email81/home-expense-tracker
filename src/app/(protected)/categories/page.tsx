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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: cats } = useQuery<any[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
      toast.success("Category created");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      name: form.get("name"),
      type: form.get("type"),
      icon: form.get("icon"),
      color: form.get("color"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage expense and income categories</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />Add Category</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue="expense">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color (hex)</Label>
                <Input id="color" name="color" type="color" defaultValue="#6366f1" />
              </div>
              <Button type="submit" className="w-full">Create Category</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Expense Categories</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {cats?.filter((c) => c.type === "expense").map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg border">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color || "#888" }} />
                  {cat.name}
                </span>
                {cat.userId && (
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cat.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Income Categories</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {cats?.filter((c) => c.type === "income").map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg border">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color || "#888" }} />
                  {cat.name}
                </span>
                {cat.userId && (
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cat.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
