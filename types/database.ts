// ============================================================
// ENUMS (alignés sur le schéma SQL)
// ============================================================
export type PropertyStatus = "active" | "archived";
export type UnitStatus = "available" | "occupied" | "maintenance";
export type UnitType =
  | "apartment"
  | "studio"
  | "room"
  | "house"
  | "office"
  | "shop"
  | "other";

// ============================================================
// ROW TYPES
// ============================================================

export type Property = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
};

export type PropertyImage = {
  id: string;
  property_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

export type Unit = {
  id: string;
  property_id: string;
  unit_number: string;
  unit_type: UnitType;
  description: string | null;
  monthly_rent: number;
  status: UnitStatus;
  floor: number | null;
  area_m2: number | null;
  created_at: string;
  updated_at: string;
};

// ============================================================
// COMPOSITE TYPES
// ============================================================

export type PropertyWithImages = Property & {
  property_images: PropertyImage[];
};

export type PropertyWithStats = Property & {
  property_images: PropertyImage[];
  units_count: number;
  units_occupied: number;
  units_available: number;
};

// ============================================================
// PHASE 5 — Tenants & Leases
// ============================================================

export type LeaseStatus = "pending" | "active" | "expired" | "terminated";

export type Tenant = {
  id: string;
  owner_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  id_number: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Lease = {
  id: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  deposit_amount: number;
  payment_due_day: number;
  status: LeaseStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// Vues enrichies
export type LeaseWithRelations = Lease & {
  tenant: Pick<Tenant, "id" | "first_name" | "last_name" | "phone"> | null;
  unit: {
    id: string;
    unit_number: string;
    property_id: string;
  } | null;
  property: {
    id: string;
    name: string;
  } | null;
};

export type TenantWithActiveLease = Tenant & {
  active_lease: {
    id: string;
    status: LeaseStatus;
    start_date: string;
    end_date: string | null;
    monthly_rent: number;
    unit_number: string;
    property_name: string;
  } | null;
};

// ============================================================
// PHASE 6 — Rent Dues & Payments
// ============================================================

export type DueStatus = "pending" | "partial" | "paid" | "late" | "cancelled";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "mobile_money"
  | "other";

export type RentDue = {
  id: string;
  lease_id: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount_due: number;
  created_at: string;
};

export type RentPayment = {
  id: string;
  rent_due_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  recorded_by: string;
  created_at: string;
};

// Vue enrichie pour la liste
export type RentDueListItem = {
  id: string;
  lease_id: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  status: DueStatus;
  tenant_id: string;
  tenant_first_name: string;
  tenant_last_name: string;
  tenant_phone: string;
  unit_id: string;
  unit_number: string;
  property_id: string;
  property_name: string;
};

// Vue détaillée
export type RentDueDetail = RentDueListItem & {
  lease_status: string;
  lease_start_date: string;
  lease_end_date: string | null;
  lease_monthly_rent: number;
};

// Paiement avec profil de l'enregistreur
export type RentPaymentWithProfile = RentPayment & {
  recorded_by_profile: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  receipt:{
    id: string;
    receipt_number: string;
    pdf_storage_path: string | null;
    issued_at: string;
  } | null;
};

// Statistiques globales
export type RentDuesStats = {
  total_due: number;
  total_paid: number;
  total_remaining: number;
  count_paid: number;
  count_partial: number;
  count_late: number;
  count_pending: number;
};

// ============================================================
// PHASE 7 — Receipts & Notifications
// ============================================================

export type NotificationType =
  | "rent_due"
  | "rent_late"
  | "payment_received"
  | "lease_expiring"
  | "system";

export type Receipt = {
  id: string;
  payment_id: string;
  receipt_number: string;
  issued_at: string;
  pdf_storage_path: string | null;
};

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  link_url: string | null;
};

export type ReceiptWithRelations = Receipt & {
  payment: {
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference: string | null;
    notes: string | null;
  } | null;
  rent_due: {
    id: string;
    period_start: string;
    period_end: string;
    due_date: string;
    amount_due: number;
  } | null;
  tenant: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
  } | null;
  unit: {
    id: string;
    unit_number: string;
  } | null;
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
  } | null;
  recorded_by: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};