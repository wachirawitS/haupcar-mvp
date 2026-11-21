"use client";

import { useState } from "react";
import { isApiError } from "@/lib/api-error";
import { useCarBrands } from "../hooks/use-car-brands";
import { useCarList } from "../hooks/use-car-list";
import { useCarListParams } from "../hooks/use-car-list-params";
import { carErrorMessage } from "../messages";
import { toCarListQuery } from "../schemas/car-list-params.schema";
import type { CarListItem, CarListSource } from "../types";
import { CarListPagination } from "./car-list-pagination";
import {
  CarListEmpty,
  CarListError,
  CarListNoMatch,
  CarListPastLastPage,
  CarListSkeleton,
  SharedLinkInvalid,
} from "./car-list-states";
import { CarListToolbar } from "./car-list-toolbar";
import { CarTable } from "./car-table";
import { SharedCarDialog } from "./shared-car-dialog";

const editHref = (car: CarListItem) => `/cars/${car.id}/edit`;

// The car list with search, brand filter, sort and paging.
// Owner: rows open the edit page. Shared link: read-only, rows open a detail dialog.
export function CarList({ source }: { source: CarListSource }) {
  const { params, setParams } = useCarListParams();
  const list = useCarList(source, toCarListQuery(params));
  const brands = useCarBrands(source);
  const [selectedCar, setSelectedCar] = useState<CarListItem | null>(null);

  const errorCode = isApiError(list.error) ? list.error.code : undefined;
  if (source.kind === "shared" && errorCode === "SHARE_LINK_NOT_FOUND") {
    return <SharedLinkInvalid />;
  }

  const hasFilters = Boolean(params.search || params.brand);

  function renderResults() {
    if (list.isError) {
      return (
        <CarListError message={carErrorMessage(errorCode)} onRetry={() => void list.refetch()} />
      );
    }
    if (!list.data) return <CarListSkeleton />;

    const { data: cars, meta } = list.data;
    if (cars.length === 0) {
      if (meta.total > 0) return <CarListPastLastPage onFirstPage={() => setParams({ page: 1 })} />;
      if (hasFilters) {
        return (
          <CarListNoMatch onClear={() => setParams({ search: undefined, brand: undefined })} />
        );
      }
      return <CarListEmpty canAdd={source.kind === "owner"} />;
    }

    return (
      <>
        <CarTable
          cars={cars}
          getHref={source.kind === "owner" ? editHref : undefined}
          onSelect={source.kind === "shared" ? setSelectedCar : undefined}
          isDimmed={list.isPlaceholderData}
          startIndex={(meta.page - 1) * meta.limit}
        />
        <CarListPagination meta={meta} onPageChange={(page) => setParams({ page })} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CarListToolbar params={params} brands={brands.data ?? []} onChange={setParams} />
      {renderResults()}
      {source.kind === "shared" && (
        <SharedCarDialog
          token={source.token}
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
        />
      )}
    </div>
  );
}
