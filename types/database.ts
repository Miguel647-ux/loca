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