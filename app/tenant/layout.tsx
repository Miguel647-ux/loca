import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/permissions";
import { LogoutButton } from "@/components/layout/logout-button";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href="/tenant"
            className="font-heading text-xl font-bold tracking-tight"
          >
            Loca
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {profile.first_name} {profile.last_name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}