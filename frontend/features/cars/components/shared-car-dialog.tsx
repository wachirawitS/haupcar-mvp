"use client";

import { CarFrontIcon, CircleAlertIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { CAR_COLOR_LABELS, CAR_COLOR_SWATCHES } from "../constants/car-colors";
import { useSharedCar } from "../hooks/use-shared-car";
import { CAR_MESSAGES, carErrorMessage } from "../messages";
import type { Car, CarListItem } from "../types";

function PhotoViewer({ car }: { car: Car }) {
  const [selected, setSelected] = useState(0);
  const image = car.images[selected];

  if (!image) {
    return (
      <div className="flex h-28 flex-col items-center justify-center gap-1 rounded-lg bg-muted text-muted-foreground">
        <CarFrontIcon className="size-8" aria-hidden />
        {CAR_MESSAGES.noPhoto}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={image.url}
        target="_blank"
        rel="noreferrer"
        title={CAR_MESSAGES.openFullPhoto}
        className="relative block aspect-video overflow-hidden rounded-lg border bg-card"
      >
        <Image
          src={image.url}
          alt={CAR_MESSAGES.photoAlt(car.registrationNumber, selected + 1)}
          fill
          unoptimized
          sizes="600px"
          className="object-contain"
        />
      </a>
      {car.images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {car.images.map((thumb, index) => (
            <li key={thumb.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={CAR_MESSAGES.showPhoto(index + 1)}
                aria-pressed={index === selected}
                className={cn(
                  "relative block h-12 w-16 overflow-hidden rounded-md bg-muted ring-offset-2 ring-offset-popover",
                  index === selected ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={thumb.url}
                  alt=""
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SpecTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-muted/60 px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1.5 font-medium">{children}</dd>
    </div>
  );
}

function CarDetails({ car }: { car: Car }) {
  return (
    <div className="flex flex-col gap-4">
      <PhotoViewer car={car} />
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SpecTile label={CAR_MESSAGES.fieldBrand}>
          <span className="truncate">{car.brand}</span>
        </SpecTile>
        <SpecTile label={CAR_MESSAGES.fieldModel}>
          <span className="truncate">{car.model}</span>
        </SpecTile>
        <SpecTile label={CAR_MESSAGES.fieldYear}>{car.year ?? CAR_MESSAGES.notSpecified}</SpecTile>
        <SpecTile label={CAR_MESSAGES.fieldColor}>
          {car.color ? (
            <>
              <span
                className="size-3.5 shrink-0 rounded-full ring-1 ring-foreground/20"
                style={{ background: CAR_COLOR_SWATCHES[car.color] }}
                aria-hidden
              />
              {CAR_COLOR_LABELS[car.color]}
            </>
          ) : (
            CAR_MESSAGES.notSpecified
          )}
        </SpecTile>
      </dl>
      <section className="flex flex-col gap-1">
        <h3 className="text-xs text-muted-foreground">{CAR_MESSAGES.fieldNotes}</h3>
        <p
          className={cn(
            "rounded-lg border px-3 py-2 whitespace-pre-line",
            !car.notes && "text-muted-foreground",
          )}
        >
          {car.notes ?? CAR_MESSAGES.noNotes}
        </p>
      </section>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label={CAR_MESSAGES.loading}>
      <Skeleton className="aspect-video w-full" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-14" />
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

// Read-only detail for the shared link. Opened from the list, so no extra page.
// The header uses the list row, so it shows at once while the details load.
export function SharedCarDialog({
  token,
  car: listCar,
  onClose,
}: {
  token: string;
  car: CarListItem | null;
  onClose: () => void;
}) {
  const car = useSharedCar(token, listCar?.id ?? null);

  return (
    <Dialog open={listCar !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {listCar && (
          <DialogHeader>
            <DialogTitle className="text-xl">{listCar.registrationNumber}</DialogTitle>
            <DialogDescription>
              {listCar.province} · {listCar.brand} {listCar.model}
            </DialogDescription>
          </DialogHeader>
        )}
        {car.isPending && <DetailsSkeleton />}
        {car.isError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>
              {carErrorMessage(isApiError(car.error) ? car.error.code : undefined)}
            </AlertDescription>
          </Alert>
        )}
        {/* Keyed so the photo viewer starts at the first photo for each car. */}
        {car.data && <CarDetails key={car.data.id} car={car.data} />}
      </DialogContent>
    </Dialog>
  );
}
