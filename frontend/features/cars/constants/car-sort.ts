import type { CarSortField, SortOrder } from "../types";

// The sort dropdown: one URL value → the API's sort + order.
export const CAR_SORT_OPTIONS = {
  newest: { sort: "createdAt", order: "desc", label: "เพิ่มล่าสุด" },
  oldest: { sort: "createdAt", order: "asc", label: "เพิ่มก่อน" },
  plate: { sort: "registrationNumber", order: "asc", label: "ทะเบียน ก–ฮ" },
  brand: { sort: "brand", order: "asc", label: "ยี่ห้อ A–Z" },
  yearNewest: { sort: "year", order: "desc", label: "ปีรถ ใหม่ → เก่า" },
} as const satisfies Record<string, { sort: CarSortField; order: SortOrder; label: string }>;

export type CarSortOption = keyof typeof CAR_SORT_OPTIONS;
export const DEFAULT_CAR_SORT: CarSortOption = "newest";
export const CAR_SORT_KEYS = Object.keys(CAR_SORT_OPTIONS) as [CarSortOption, ...CarSortOption[]];

export const CAR_PAGE_SIZE = 20;
