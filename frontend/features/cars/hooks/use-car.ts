import { useQuery } from "@tanstack/react-query";
import { getCar } from "../api/cars-api";
import { carKeys } from "../query-keys";

export function useCar(id: string) {
  return useQuery({ queryKey: carKeys.detail(id), queryFn: () => getCar(id) });
}
