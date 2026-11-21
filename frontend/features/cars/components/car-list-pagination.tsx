"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CAR_MESSAGES } from "../messages";
import type { PageMeta } from "../types";

export function CarListPagination({
  meta,
  onPageChange,
}: {
  meta: PageMeta;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(meta.totalPages, 1);

  return (
    <nav
      aria-label="pagination"
      className="flex flex-col items-center justify-between gap-2 sm:flex-row"
    >
      <p className="text-muted-foreground" aria-live="polite">
        {CAR_MESSAGES.pageStatus(meta.page, totalPages, meta.total)}
      </p>
      {totalPages > 1 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
          >
            <ChevronLeftIcon />
            {CAR_MESSAGES.previousPage}
          </Button>
          <Button
            variant="outline"
            disabled={meta.page >= totalPages}
            onClick={() => onPageChange(meta.page + 1)}
          >
            {CAR_MESSAGES.nextPage}
            <ChevronRightIcon />
          </Button>
        </div>
      )}
    </nav>
  );
}
