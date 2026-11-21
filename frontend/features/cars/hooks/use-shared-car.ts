import { useQuery } from "@tanstack/react-query";
import { getSharedCar } from "../api/cars-api";
import { carKeys } from "../query-keys";

export function useSharedCar(token: string, id: string | null) {
  return useQuery({
    queryKey: carKeys.sharedDetail(token, id ?? ""),
    queryFn: () => getSharedCar(token, id ?? ""),
    enabled: id !== null,
  });
}
