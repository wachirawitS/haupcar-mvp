import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { AUTH_MESSAGES } from "@/features/auth/messages";
import { CarList } from "@/features/cars/components/car-list";
import { CarListSkeleton } from "@/features/cars/components/car-list-states";
import { ShareLinkDialog } from "@/features/cars/components/share-link-dialog";
import { CAR_MESSAGES } from "@/features/cars/messages";

export const metadata: Metadata = {
  title: `${CAR_MESSAGES.listTitle} | ${AUTH_MESSAGES.appName}`,
};

export default function CarsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{CAR_MESSAGES.listTitle}</h1>
        <div className="flex gap-2">
          <ShareLinkDialog />
          <Button render={<Link href="/cars/new" />} nativeButton={false}>
            <PlusIcon />
            {CAR_MESSAGES.addCar}
          </Button>
        </div>
      </div>
      <Suspense fallback={<CarListSkeleton />}>
        <CarList source={{ kind: "owner" }} />
      </Suspense>
    </div>
  );
}
