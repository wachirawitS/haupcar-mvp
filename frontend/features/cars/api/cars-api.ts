import { apiRequest } from "@/lib/api-client";
import type { Car, CarColor, CarImage, CarListQuery, CarPage } from "../types";

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

// ---- Owner: single car, create / update / delete, images ----

export type CarBody = {
  registrationNumber: string;
  province: string;
  brand: string;
  model: string;
  year: number | null;
  color: CarColor | null;
  notes: string | null;
};

export function getCar(id: string): Promise<Car> {
  return apiRequest<Car>(`/cars/${encodeURIComponent(id)}`);
}

export function createCar(body: CarBody): Promise<Car> {
  return apiRequest<Car>("/cars", { method: "POST", body });
}

// Sends every field; null clears year, color and notes.
export function updateCar(id: string, body: CarBody): Promise<Car> {
  return apiRequest<Car>(`/cars/${encodeURIComponent(id)}`, { method: "PATCH", body });
}

export function deleteCar(id: string): Promise<void> {
  return apiRequest<void>(`/cars/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function uploadCarImages(id: string, files: File[]): Promise<CarImage[]> {
  const body = new FormData();
  for (const file of files) body.append("files", file);
  return apiRequest<CarImage[]>(`/cars/${encodeURIComponent(id)}/images`, { method: "POST", body });
}

export function deleteCarImage(id: string, imageId: string): Promise<void> {
  return apiRequest<void>(`/cars/${encodeURIComponent(id)}/images/${encodeURIComponent(imageId)}`, {
    method: "DELETE",
  });
}
