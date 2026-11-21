import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_MESSAGES } from "@/features/auth/messages";
import { BackToListLink } from "@/features/cars/components/back-to-list-link";
import { CarEditPage } from "@/features/cars/components/car-edit-page";
import { CAR_FORM_MESSAGES } from "@/features/cars/messages";

export const metadata: Metadata = {
  title: `${CAR_FORM_MESSAGES.editPageTitle} | ${AUTH_MESSAGES.appName}`,
};

async function EditCar({ params }: Pick<PageProps<"/cars/[id]/edit">, "params">) {
  const { id } = await params;
  return <CarEditPage id={id} />;
}

export default function EditCarPage({ params }: PageProps<"/cars/[id]/edit">) {
  return (
    <div className="flex flex-col gap-6">
      <BackToListLink />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <EditCar params={params} />
      </Suspense>
    </div>
  );
}
