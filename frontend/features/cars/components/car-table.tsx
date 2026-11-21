"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CAR_COLOR_LABELS } from "../constants/car-colors";
import { CAR_MESSAGES } from "../messages";
import type { CarListItem } from "../types";
import { CarThumbnail } from "./car-thumbnail";

type CarTableProps = {
  cars: CarListItem[];
  // Owner: rows go to the edit page. Shared: rows open the read-only detail.
  getHref?: (car: CarListItem) => string;
  onSelect?: (car: CarListItem) => void;
  isDimmed?: boolean;
};

function display(value: string | number | null): string {
  return value === null ? CAR_MESSAGES.notSpecified : String(value);
}

// The one focusable element per car: a link (owner) or a button (shared).
function CarOpener({
  car,
  getHref,
  onSelect,
  className,
  children,
}: Pick<CarTableProps, "getHref" | "onSelect"> & {
  car: CarListItem;
  className?: string;
  children: ReactNode;
}) {
  if (getHref) {
    return (
      <Link href={getHref(car)} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => onSelect?.(car)} className={cn("text-left", className)}>
      {children}
    </button>
  );
}

// Desktop: a table. Phone: the same cars as stacked cards.
export function CarTable({ cars, getHref, onSelect, isDimmed = false }: CarTableProps) {
  const router = useRouter();

  function openCar(car: CarListItem, event: MouseEvent<HTMLTableRowElement>) {
    // The plate link/button handles its own click.
    if ((event.target as HTMLElement).closest("a, button")) return;
    if (getHref) router.push(getHref(car));
    else onSelect?.(car);
  }

  return (
    <div className={cn("transition-opacity", isDimmed && "opacity-60")} aria-busy={isDimmed}>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">{CAR_MESSAGES.columnPhoto}</TableHead>
              <TableHead>{CAR_MESSAGES.columnPlate}</TableHead>
              <TableHead>{CAR_MESSAGES.columnBrandModel}</TableHead>
              <TableHead className="w-20">{CAR_MESSAGES.columnYear}</TableHead>
              <TableHead className="w-24">{CAR_MESSAGES.columnColor}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => (
              // Mouse users can click anywhere on the row; keyboard users tab to the plate.
              <TableRow
                key={car.id}
                className="cursor-pointer"
                onClick={(event) => openCar(car, event)}
              >
                <TableCell>
                  <CarThumbnail image={car.coverImage} plate={car.registrationNumber} />
                </TableCell>
                <TableCell>
                  <CarOpener
                    car={car}
                    getHref={getHref}
                    onSelect={onSelect}
                    className="font-medium underline-offset-4 hover:underline focus-visible:underline"
                  >
                    {car.registrationNumber}
                  </CarOpener>
                  <div className="text-muted-foreground">{car.province}</div>
                </TableCell>
                <TableCell>
                  <div>{car.brand}</div>
                  <div className="text-muted-foreground">{car.model}</div>
                </TableCell>
                <TableCell>{display(car.year)}</TableCell>
                <TableCell>
                  {car.color ? CAR_COLOR_LABELS[car.color] : CAR_MESSAGES.notSpecified}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-2 md:hidden">
        {cars.map((car) => (
          <li key={car.id}>
            <CarOpener
              car={car}
              getHref={getHref}
              onSelect={onSelect}
              className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted/50"
            >
              <CarThumbnail image={car.coverImage} plate={car.registrationNumber} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">
                  {car.registrationNumber}{" "}
                  <span className="font-normal text-muted-foreground">{car.province}</span>
                </span>
                <span className="truncate">
                  {car.brand} {car.model}
                </span>
                <span className="text-muted-foreground">
                  {display(car.year)} ·{" "}
                  {car.color ? CAR_COLOR_LABELS[car.color] : CAR_MESSAGES.notSpecified}
                </span>
              </span>
            </CarOpener>
          </li>
        ))}
      </ul>
    </div>
  );
}
