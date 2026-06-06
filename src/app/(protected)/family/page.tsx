"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Mail, Crown } from "lucide-react";
import { toast } from "sonner";

export default function FamilyPage() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  const { data: family } = useQuery<any>({
    queryKey: ["family"],
    queryFn: () => fetch("/api/family").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
      setOpenCreate(false);
      toast.success("Family created");
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      fetch("/api/family/add-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
      setOpenAdd(false);
      toast.success("Member added");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate(form.get("name") as string);
  }

  function handleAddMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    addMemberMutation.mutate({
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Family</h2>
          <p className="text-muted-foreground">Manage your family sharing</p>
        </div>
        {family?.isOwner && (
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger render={<Button><Mail className="h-4 w-4 mr-2" />Add Member</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Add Family Member</DialogTitle></DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input name="name" required placeholder="Member's name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" required placeholder="member@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input name="password" type="password" required placeholder="Set their password" />
                  <p className="text-xs text-muted-foreground">
                    The member will use these credentials to log in.
                  </p>
                </div>
                <Button type="submit" className="w-full">Add to Family</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {family ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>{family.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Family members share all expenses and incomes.
              </p>
              <p className="text-sm text-muted-foreground">
                Only the family owner (who created it) can add new members.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <CardTitle>Members ({family.members?.length || 0})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {family.members?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members yet</p>
              ) : (
                <div className="space-y-2">
                  {family.members?.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                      {m.id === family.ownerId && (
                        <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                          <Crown className="h-3 w-3" /> Owner
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Create a Family</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Start a family group. As the owner, you can add members by providing their name, email, and password.
              </p>
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />Create Family</Button>} />
                <DialogContent>
                  <DialogHeader><DialogTitle>Create a Family</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Family Name</Label>
                      <Input name="name" required placeholder="e.g. The Smiths" />
                    </div>
                    <Button type="submit" className="w-full">Create</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
