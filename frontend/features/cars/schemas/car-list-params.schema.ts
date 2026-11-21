import { z } from "zod";
import {
  CAR_PAGE_SIZE,
  CAR_SORT_KEYS,
  CAR_SORT_OPTIONS,
  DEFAULT_CAR_SORT,
} from "../constants/car-sort";
import type { CarListQuery } from "../types";

// List state lives in the URL (§4). Bad values fall back to defaults instead of
// breaking the page, and are validated before they reach the API.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined);

export const carListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: optionalText(100),
  brand: optionalText(50),
  sort: z.enum(CAR_SORT_KEYS).catch(DEFAULT_CAR_SORT),
});

export type CarListParams = z.infer<typeof carListParamsSchema>;

export function parseCarListParams(searchParams: URLSearchParams): CarListParams {
  return carListParamsSchema.parse({
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });
}

export function toCarListQuery(params: CarListParams): CarListQuery {
  const { sort, order } = CAR_SORT_OPTIONS[params.sort];
  return {
    page: params.page,
    limit: CAR_PAGE_SIZE,
    search: params.search,
    brand: params.brand,
    sort,
    order,
  };
}

// Defaults are left out so URLs stay short ("/cars" instead of "/cars?page=1&sort=newest").
export function toCarListSearchParams(params: CarListParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.brand) searchParams.set("brand", params.brand);
  if (params.sort !== DEFAULT_CAR_SORT) searchParams.set("sort", params.sort);
  if (params.page > 1) searchParams.set("page", String(params.page));
  return searchParams;
}
