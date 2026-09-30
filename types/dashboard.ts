// ============================================================
// PHASE 8 — Dashboards
// ============================================================

export type OwnerDashboardCounts = {
  properties: number;
  units_total: number;
  units_available: number;
  units_occupied: number;
  units_maintenance: number;
  leases_active: number;
};

export type OwnerDashboardUnitsByStatus = {
  available: number;
  occupied: number;
  maintenance: number;
};

export type OwnerDashboardFinance = {
  total_due: number;
  total_paid: number;
  total_remaining: number;
  count_paid: number;
  count_partial: number;
  count_late: number;
  count_pending: number;
};

export type OwnerDashboardRecentPayment = {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  rent_due_id: string;
  created_at: string;
  tenant_id: string;
  tenant_first_name: string;
  tenant_last_name: string;
  unit_number: string;
  property_name: string;
};

export type OwnerDashboardLateDue = {
  id: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  days_late: number;
  tenant_id: string;
  tenant_first_name: string;
  tenant_last_name: string;
  unit_number: string;
  property_name: string;
};

export type OwnerDashboard = {
  counts: OwnerDashboardCounts;
  units_by_status: OwnerDashboardUnitsByStatus;
  finance: OwnerDashboardFinance;
  recent_payments: OwnerDashboardRecentPayment[];
  late_dues: OwnerDashboardLateDue[];
};

// ============================================================
// TENANT
// ============================================================

export type TenantDashboardTenant = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
};

export type TenantDashboardActiveLease = {
  lease_id: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  deposit_amount: number;
  payment_due_day: number;
  status: string;
  unit_id: string;
  unit_number: string;
  property_id: string;
  property_name: string;
  address: string;
  city: string;
};

export type TenantDashboardDue = {
  id: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  status: string;
};

export type TenantDashboardPayment = {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  notes: string | null;
  rent_due_id: string;
  created_at: string;
  receipt_id: string | null;
  receipt_number: string | null;
};

export type TenantDashboardFinance = {
  total_due: number;
  total_paid: number;
  total_remaining: number;
  count_late: number;
};

export type TenantDashboardLinked = {
  linked: true;
  tenant: TenantDashboardTenant;
  active_lease: TenantDashboardActiveLease | null;
  dues: TenantDashboardDue[];
  payments: TenantDashboardPayment[];
  finance: TenantDashboardFinance;
  unread_notifications: number;
};

export type TenantDashboardNotLinked = {
  linked: false;
};

export type TenantDashboard = TenantDashboardLinked | TenantDashboardNotLinked;