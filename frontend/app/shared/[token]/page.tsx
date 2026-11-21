import type { Metadata } from "next";
import { Suspense } from "react";
import { AUTH_MESSAGES } from "@/features/auth/messages";
import { CarList } from "@/features/cars/components/car-list";
import { CarListSkeleton } from "@/features/cars/components/car-list-states";
import { CAR_MESSAGES } from "@/features/cars/messages";

export const metadata: Metadata = {
  title: `${CAR_MESSAGES.sharedTitle} | ${AUTH_MESSAGES.appName}`,
  // A private link: keep it out of search engines.
  robots: { index: false, follow: false },
};

async function SharedCarList({ params }: Pick<PageProps<"/shared/[token]">, "params">) {
  const { token } = await params;
  return <CarList source={{ kind: "shared", token }} />;
}

// Public, read-only list opened from the "Share" link. No login needed.
export default function SharedCarsPage({ params }: PageProps<"/shared/[token]">) {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <span className="font-semibold">{AUTH_MESSAGES.appName}</span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4">
        <div>
          <h1 className="text-xl font-semibold">{CAR_MESSAGES.sharedTitle}</h1>
          <p className="text-muted-foreground">{CAR_MESSAGES.sharedDescription}</p>
        </div>
        <Suspense fallback={<CarListSkeleton />}>
          <SharedCarList params={params} />
        </Suspense>
      </main>
    </>
  );
}
