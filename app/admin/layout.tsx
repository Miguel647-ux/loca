import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // SÉCURITÉ CRITIQUE : Si ce n'est pas un admin, on redirige
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r bg-card flex-col hidden lg:flex">
        <div className="h-14 flex items-center px-4 border-b">
          <Logo href="/admin" />
          <span className="ml-2 text-xs font-medium bg-[var(--brand)]/10 text-[var(--brand)] px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted font-medium">
            <LayoutDashboard className="size-4" /> Vue d'ensemble
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted font-medium">
            <Users className="size-4" /> Utilisateurs
          </Link>
        </nav>
        <div className="p-3 border-t">
          <form action={signOut}>
            <Button variant="ghost" className="w-full justify-start text-destructive">
              <LogOut className="size-4 mr-2" /> Déconnexion
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8">
        <div className="lg:hidden mb-4">
          <Logo href="/admin" />
        </div>
        {children}
      </main>
    </div>
  );
}