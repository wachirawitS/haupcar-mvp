"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateCar } from "../hooks/use-car-mutations";
import { CAR_FORM_MESSAGES as M } from "../messages";
import { type CarFormOutput, EMPTY_CAR_FORM } from "../schemas/car-form.schema";
import { CarForm } from "./car-form";
import { LocalCarImageGallery } from "./car-image-gallery";

export function CarCreatePage() {
  const router = useRouter();
  const createCar = useCreateCar();
  const [files, setFiles] = useState<File[]>([]);

  async function submit(body: CarFormOutput) {
    const { car, failedImages } = await createCar.mutateAsync({ body, files });
    // Next keeps this page alive: start empty next time.
    setFiles([]);
    if (failedImages > 0) {
      router.replace(`/cars/${car.id}/edit?imagesFailed=${failedImages}`);
    } else {
      toast.success(M.created);
      router.push("/cars");
    }
    return EMPTY_CAR_FORM;
  }

  return (
    <Card>
      <CardContent>
        <CarForm defaultValues={EMPTY_CAR_FORM} onSubmit={submit}>
          <LocalCarImageGallery
            files={files}
            onFilesChange={setFiles}
            disabled={createCar.isPending}
          />
        </CarForm>
      </CardContent>
    </Card>
  );
}
