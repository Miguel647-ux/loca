"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUserRole, deleteUser } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserCog } from "lucide-react";

export function AdminUserList({ users }: { users: any[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function handleRoleChange(id: string, currentRole: string) {
    const roles = ["owner", "tenant", "admin"];
    const newRole = roles[(roles.indexOf(currentRole) + 1) % roles.length] as any;
    if (!confirm(`Passer le rôle à ${newRole} ?`)) return;
    
    setPending(id);
    const res = await updateUserRole(id, newRole);
    setPending(null);
    if (res.success) { toast.success(res.message); router.refresh(); }
    else toast.error(res.error);
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Supprimer définitivement ${email} ? Cette action est irréversible.`)) return;
    
    setPending(id);
    const res = await deleteUser(id);
    setPending(null);
    if (res.success) { toast.success(res.message); router.refresh(); }
    else toast.error(res.error);
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Utilisateur</th>
            <th className="px-4 py-3 text-left font-medium">Rôle</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-muted/20">
              <td className="px-4 py-3">
                <p className="font-medium">{u.first_name} {u.last_name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </td>
              <td className="px-4 py-3">
                <Badge variant={u.role === 'admin' ? 'default' : u.role === 'owner' ? 'outline' : 'secondary'}>
                  {u.role}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleRoleChange(u.id, u.role)} disabled={pending === u.id}>
                  <UserCog className="size-4 mr-1" /> Changer rôle
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id, u.email)} disabled={pending === u.id}>
                  <Trash2 className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}