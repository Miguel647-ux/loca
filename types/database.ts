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

