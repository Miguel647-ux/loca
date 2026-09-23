import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/permissions";
import { Logo } from "@/components/layout/logo";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  const userMenuProfile = {
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: user.email ?? "",
    avatarUrl: profile.avatar_url,
    role: profile.role,
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-card">
        <div className="flex h-14 items-center border-b px-4">
          <Logo href="/dashboard" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent variant="owner" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          variant="owner"
          profile={userMenuProfile}
          notificationsHref="/dashboard/notifications"
          settingsHref="/dashboard/settings"
          homeHref="/dashboard"
        />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}