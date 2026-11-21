"use client";

import { CircleAlertIcon } from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api-error";
import { CAR_COLOR_LABELS } from "../constants/car-colors";
import { useSharedCar } from "../hooks/use-shared-car";
import { CAR_MESSAGES, carErrorMessage } from "../messages";
import type { Car } from "../types";

function CarDetails({ car }: { car: Car }) {
  const fields: [string, string][] = [
    [CAR_MESSAGES.fieldProvince, car.province],
    [CAR_MESSAGES.fieldBrand, car.brand],
    [CAR_MESSAGES.fieldModel, car.model],
    [CAR_MESSAGES.fieldYear, car.year === null ? CAR_MESSAGES.notSpecified : String(car.year)],
    [CAR_MESSAGES.fieldColor, car.color ? CAR_COLOR_LABELS[car.color] : CAR_MESSAGES.notSpecified],
  ];

  return (
    <div className="flex flex-col gap-4">
      {car.images.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {car.images.map((image, index) => (
            <li key={image.id}>
              <a href={image.url} target="_blank" rel="noreferrer">
                <Image
                  src={image.url}
                  alt={CAR_MESSAGES.photoAlt(car.registrationNumber, index + 1)}
                  width={240}
                  height={180}
                  unoptimized
                  className="aspect-4/3 w-full rounded-md bg-muted object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        {fields.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <dt className="text-muted-foreground">{CAR_MESSAGES.fieldNotes}</dt>
        <dd className="whitespace-pre-line">{car.notes ?? CAR_MESSAGES.notSpecified}</dd>
      </dl>
    </div>
  );
}

// Read-only detail for the shared link. Opened from the list, so no extra page.
export function SharedCarDialog({
  token,
  carId,
  plate,
  onClose,
}: {
  token: string;
  carId: string | null;
  plate: string;
  onClose: () => void;
}) {
  const car = useSharedCar(token, carId);

  return (
    <Dialog open={carId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {CAR_MESSAGES.detailTitle} {plate}
          </DialogTitle>
          <DialogDescription className="sr-only">{CAR_MESSAGES.sharedTitle}</DialogDescription>
        </DialogHeader>
        {car.isPending && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
        {car.isError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>
              {carErrorMessage(isApiError(car.error) ? car.error.code : undefined)}
            </AlertDescription>
          </Alert>
        )}
        {car.data && <CarDetails car={car.data} />}
      </DialogContent>
    </Dialog>
  );
}
