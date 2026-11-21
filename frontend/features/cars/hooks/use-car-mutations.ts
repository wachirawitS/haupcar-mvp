import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type CarBody,
  createCar,
  deleteCar,
  deleteCarImage,
  updateCar,
  uploadCarImages,
} from "../api/cars-api";
import { carKeys } from "../query-keys";
import type { Car } from "../types";

// The list and brand filter must show the change on the next visit.
function invalidateCarLists(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: carKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: carKeys.brands() });
}

// Create flow (§5.5): save the car, then its photos. If only the photos fail, the car stays
// saved (never rolled back) and the caller is told how many photos failed.
export function useCreateCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, files }: { body: CarBody; files: File[] }) => {
      const car = await createCar(body);
      if (files.length === 0) return { car, failedImages: 0 };
      try {
        const images = await uploadCarImages(car.id, files);
        return { car: { ...car, images }, failedImages: 0 };
      } catch {
        return { car, failedImages: files.length };
      }
    },
    onSuccess: ({ car }) => {
      queryClient.setQueryData(carKeys.detail(car.id), car);
      invalidateCarLists(queryClient);
    },
  });
}

export function useUpdateCar(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CarBody) => updateCar(id, body),
    onSuccess: (car) => {
      queryClient.setQueryData(carKeys.detail(id), car);
      invalidateCarLists(queryClient);
    },
  });
}

export function useDeleteCar(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteCar(id),
    onSettled: () => invalidateCarLists(queryClient),
    onSuccess: () => queryClient.removeQueries({ queryKey: carKeys.detail(id) }),
  });
}

// Photos change the cover in the list too.
export function useUploadCarImages(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => uploadCarImages(id, files),
    onSuccess: (images) => {
      queryClient.setQueryData<Car>(carKeys.detail(id), (car) =>
        car ? { ...car, images: [...car.images, ...images] } : car,
      );
      invalidateCarLists(queryClient);
    },
  });
}

export function useDeleteCarImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => deleteCarImage(id, imageId),
    onSuccess: (_, imageId) => {
      queryClient.setQueryData<Car>(carKeys.detail(id), (car) =>
        car ? { ...car, images: car.images.filter((image) => image.id !== imageId) } : car,
      );
      invalidateCarLists(queryClient);
    },
  });
}
