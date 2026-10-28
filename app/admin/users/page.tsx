import { getAdminUsers } from "@/actions/admin";
import { AdminUserList } from "@/components/admin/admin-user-list";

export default async function AdminUsersPage() {
  const result = await getAdminUsers("", 1, 100);
  
  if (!result.success) {
    return <div className="text-destructive">{result.error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground mt-1">Gérez les accès à la plateforme.</p>
      </div>
      <AdminUserList users={result.data.items} />
    </div>
  );
}