import type { Metadata } from "next";
import { AUTH_MESSAGES } from "@/features/auth/messages";
import { BackToListLink } from "@/features/cars/components/back-to-list-link";
import { CarCreatePage } from "@/features/cars/components/car-create-page";
import { CAR_FORM_MESSAGES } from "@/features/cars/messages";

export const metadata: Metadata = {
  title: `${CAR_FORM_MESSAGES.addTitle} | ${AUTH_MESSAGES.appName}`,
};

export default function NewCarPage() {
  return (
    <div className="flex flex-col gap-6">
      <BackToListLink />
      <h1 className="text-xl font-semibold">{CAR_FORM_MESSAGES.addTitle}</h1>
      <CarCreatePage />
    </div>
  );
}
