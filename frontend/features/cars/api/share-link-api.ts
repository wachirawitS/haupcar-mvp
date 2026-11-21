import { apiRequest } from "@/lib/api-client";
import type { ShareLink } from "../types";

// Returns the current link, or creates one if there is none.
export function getOrCreateShareLink(): Promise<ShareLink> {
  return apiRequest<ShareLink>("/share-link", { method: "POST" });
}

// The old link stops working.
export function revokeShareLink(): Promise<void> {
  return apiRequest<void>("/share-link", { method: "DELETE" });
}
