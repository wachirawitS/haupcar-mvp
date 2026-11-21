import { apiRequest } from "@/lib/api-client";
import type { Car, CarListQuery, CarPage } from "../types";

export function listCars(query: CarListQuery): Promise<CarPage> {
  return apiRequest<CarPage>("/cars", { query });
}

export function listCarBrands(): Promise<string[]> {
  return apiRequest<string[]>("/cars/brands");
}

// Read-only routes for the shared link: public, the token is in the path.
const sharedPath = (token: string) => `/shared/${encodeURIComponent(token)}/cars`;

export function listSharedCars(token: string, query: CarListQuery): Promise<CarPage> {
  return apiRequest<CarPage>(sharedPath(token), { query });
}

export function listSharedCarBrands(token: string): Promise<string[]> {
  return apiRequest<string[]>(`${sharedPath(token)}/brands`);
}

export function getSharedCar(token: string, id: string): Promise<Car> {
  return apiRequest<Car>(`${sharedPath(token)}/${encodeURIComponent(id)}`);
}
