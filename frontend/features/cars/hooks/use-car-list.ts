import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listCars, listSharedCars } from "../api/cars-api";
import { carKeys } from "../query-keys";
import type { CarListQuery, CarListSource } from "../types";

export function useCarList(source: CarListSource, query: CarListQuery) {
  return useQuery({
    queryKey:
      source.kind === "owner" ? carKeys.list(query) : carKeys.sharedList(source.token, query),
    queryFn: () =>
      source.kind === "owner" ? listCars(query) : listSharedCars(source.token, query),
    // Keep showing the current rows while the next page / search loads.
    placeholderData: keepPreviousData,
  });
}
