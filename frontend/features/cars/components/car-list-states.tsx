"use client";

import { CarFrontIcon, CircleAlertIcon, LinkIcon, PlusIcon, SearchXIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CAR_MESSAGES } from "../messages";

const SKELETON_ROWS = 5;

export function CarListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy aria-label={CAR_MESSAGES.loading}>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <Skeleton className="h-12 w-16" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-card px-4 py-12 text-center">
      <div className="text-muted-foreground [&_svg]:size-8">{icon}</div>
      <p className="font-medium">{title}</p>
      {description && <p className="text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function CarListEmpty({ canAdd }: { canAdd: boolean }) {
  return (
    <EmptyState
      icon={<CarFrontIcon />}
      title={CAR_MESSAGES.emptyTitle}
      description={
        canAdd ? CAR_MESSAGES.emptyOwnerDescription : CAR_MESSAGES.emptySharedDescription
      }
      action={
        canAdd && (
          <Button render={<Link href="/cars/new" />} nativeButton={false}>
            <PlusIcon />
            {CAR_MESSAGES.addCar}
          </Button>
        )
      }
    />
  );
}

export function CarListNoMatch({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={<SearchXIcon />}
      title={CAR_MESSAGES.noMatchTitle}
      description={CAR_MESSAGES.noMatchDescription}
      action={
        <Button variant="outline" onClick={onClear}>
          {CAR_MESSAGES.clearSearch}
        </Button>
      }
    />
  );
}

export function CarListPastLastPage({ onFirstPage }: { onFirstPage: () => void }) {
  return (
    <EmptyState
      icon={<SearchXIcon />}
      title={CAR_MESSAGES.pastLastPageTitle}
      action={
        <Button variant="outline" onClick={onFirstPage}>
          {CAR_MESSAGES.backToFirstPage}
        </Button>
      }
    />
  );
}

// Never looks like "no cars": says it failed and offers a retry (§7).
export function CarListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{CAR_MESSAGES.loadErrorTitle}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline" onClick={onRetry}>
          {CAR_MESSAGES.retry}
        </Button>
      </AlertAction>
    </Alert>
  );
}

export function SharedLinkInvalid() {
  return (
    <EmptyState
      icon={<LinkIcon />}
      title={CAR_MESSAGES.sharedInvalidTitle}
      description={CAR_MESSAGES.sharedInvalidDescription}
    />
  );
}
