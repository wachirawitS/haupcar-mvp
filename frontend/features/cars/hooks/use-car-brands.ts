import { useQuery } from "@tanstack/react-query";
import { listCarBrands, listSharedCarBrands } from "../api/cars-api";
import { carKeys } from "../query-keys";
import type { CarListSource } from "../types";

export function useCarBrands(source: CarListSource) {
  return useQuery({
    queryKey: source.kind === "owner" ? carKeys.brands() : carKeys.sharedBrands(source.token),
    queryFn: () => (source.kind === "owner" ? listCarBrands() : listSharedCarBrands(source.token)),
  });
}
