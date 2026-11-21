// Wire types for the Cars API (backend CarResponseDto & co). Field names and nulls match exactly.

export type CarColor =
  | "white"
  | "black"
  | "silver"
  | "gray"
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "brown"
  | "gold"
  | "other";

export type CarImage = { id: string; url: string; createdAt: string };

export type CarListItem = {
  id: string;
  registrationNumber: string;
  province: string;
  brand: string;
  model: string;
  year: number | null;
  color: CarColor | null;
  coverImage: CarImage | null;
  createdAt: string;
  updatedAt: string;
};

export type Car = Omit<CarListItem, "coverImage"> & {
  notes: string | null;
  images: CarImage[];
};

export type PageMeta = { page: number; limit: number; total: number; totalPages: number };
export type CarPage = { data: CarListItem[]; meta: PageMeta };

export type CarSortField = "createdAt" | "registrationNumber" | "brand" | "model" | "year";
export type SortOrder = "asc" | "desc";

export type CarListQuery = {
  page: number;
  limit: number;
  search?: string;
  brand?: string;
  sort: CarSortField;
  order: SortOrder;
};

export type ShareLink = { token: string; createdAt: string };

// Where the list reads from: the logged-in owner, or a public share link.
export type CarListSource = { kind: "owner" } | { kind: "shared"; token: string };
