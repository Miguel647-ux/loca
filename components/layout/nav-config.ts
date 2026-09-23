import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileText,
  CreditCard,
  Receipt,
  Bell,
  Settings,
  Home,
  Wallet,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ownerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Propriétés", href: "/dashboard/properties", icon: Building2 },
  { label: "Logements", href: "/dashboard/units", icon: DoorOpen },
  { label: "Locataires", href: "/dashboard/tenants", icon: Users },
  { label: "Baux", href: "/dashboard/leases", icon: FileText },
  { label: "Paiements", href: "/dashboard/payments", icon: CreditCard },
  { label: "Reçus", href: "/dashboard/receipts", icon: Receipt },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export const tenantNavItems: NavItem[] = [
  { label: "Accueil", href: "/tenant", icon: Home },
  { label: "Mon logement", href: "/tenant/rental", icon: DoorOpen },
  { label: "Paiements", href: "/tenant/payments", icon: Wallet },
  { label: "Reçus", href: "/tenant/receipts", icon: Receipt },
  { label: "Notifications", href: "/tenant/notifications", icon: Bell },
  { label: "Mon profil", href: "/tenant/profile", icon: User },
];