"use client";

import { CircleAlertIcon, SearchXIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api-error";
import { useCar } from "../hooks/use-car";
import { useUpdateCar } from "../hooks/use-car-mutations";
import { CAR_FORM_MESSAGES as M, CAR_MESSAGES, carErrorMessage } from "../messages";
import { type CarFormOutput, carToFormValues } from "../schemas/car-form.schema";
import type { Car } from "../types";
import { CarForm } from "./car-form";
import { RemoteCarImageGallery } from "./car-image-gallery";
import { DeleteCarDialog } from "./delete-car-dialog";

function EditSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label={CAR_MESSAGES.loading}>
      <Skeleton className="h-7 w-48" />
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-14" />
        ))}
      </div>
    </div>
  );
}

function CarNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-12 text-center">
      <SearchXIcon className="size-8 text-muted-foreground" />
      <p className="font-medium">{M.notFoundTitle}</p>
      <p className="text-muted-foreground">{M.notFoundDescription}</p>
      <Button variant="outline" render={<Link href="/cars" />} nativeButton={false}>
        {M.backToList}
      </Button>
    </div>
  );
}

function EditCar({ car }: { car: Car }) {
  const router = useRouter();
  const pathname = usePathname();
  const imagesFailed = Number(useSearchParams().get("imagesFailed")) || 0;
  const updateCar = useUpdateCar(car.id);

  async function submit(body: CarFormOutput) {
    const saved = await updateCar.mutateAsync(body);
    toast.success(M.updated);
    router.push("/cars");
    return carToFormValues(saved);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{M.editTitle(car.registrationNumber)}</h1>

      {imagesFailed > 0 && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{M.photosFailed(imagesFailed)}</AlertDescription>
        </Alert>
      )}

      <CarForm defaultValues={carToFormValues(car)} onSubmit={submit} />

      <Separator />
      <RemoteCarImageGallery
        carId={car.id}
        plate={car.registrationNumber}
        images={car.images}
        onUploaded={() => {
          if (imagesFailed > 0) router.replace(pathname, { scroll: false });
        }}
      />

      <Separator />
      <section className="flex flex-col gap-3 rounded-lg border border-destructive/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-medium">{M.dangerTitle}</h2>
          <p className="text-muted-foreground">{M.dangerDescription}</p>
        </div>
        <DeleteCarDialog carId={car.id} plate={car.registrationNumber} />
      </section>
    </div>
  );
}

export function CarEditPage({ id }: { id: string }) {
  const car = useCar(id);

  if (car.isPending) return <EditSkeleton />;
  if (car.isError) {
    const code = isApiError(car.error) ? car.error.code : undefined;
    // A malformed id is rejected as 400 before the lookup; for the user it is the same "not found".
    if (code === "CAR_NOT_FOUND" || code === "BAD_REQUEST" || code === "VALIDATION_FAILED") {
      return <CarNotFound />;
    }
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>{CAR_MESSAGES.detailLoadError}</AlertTitle>
        <AlertDescription>{carErrorMessage(code)}</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="outline" onClick={() => void car.refetch()}>
            {CAR_MESSAGES.retry}
          </Button>
        </AlertAction>
      </Alert>
    );
  }
  // Keyed by id: the form takes its defaults once, so a background refetch never
  // overwrites what the user is typing (§5.3).
  return <EditCar key={car.data.id} car={car.data} />;
}
