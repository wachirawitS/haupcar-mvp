import type { CarListQuery } from "./types";

// Owner and shared views are cached separately: a shared token must never reuse owner data.
export const carKeys = {
  all: ["cars"] as const,
  lists: () => [...carKeys.all, "list"] as const,
  list: (query: CarListQuery) => [...carKeys.lists(), query] as const,
  brands: () => [...carKeys.all, "brands"] as const,
  detail: (id: string) => [...carKeys.all, "detail", id] as const,
  shared: (token: string) => ["shared-cars", token] as const,
  sharedList: (token: string, query: CarListQuery) =>
    [...carKeys.shared(token), "list", query] as const,
  sharedBrands: (token: string) => [...carKeys.shared(token), "brands"] as const,
  sharedDetail: (token: string, id: string) => [...carKeys.shared(token), "detail", id] as const,
};
