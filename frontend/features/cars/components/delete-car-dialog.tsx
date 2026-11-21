"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api-error";
import { useDeleteCar } from "../hooks/use-car-mutations";
import { CAR_FORM_MESSAGES as M, carErrorMessage } from "../messages";

// Confirm names the car (§6.1). Errors stay inside the open dialog (§7).
export function DeleteCarDialog({ carId, plate }: { carId: string; plate: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const deleteCar = useDeleteCar(carId);

  function onDeleted() {
    setIsOpen(false);
    toast.success(M.deleted(plate));
    router.replace("/cars");
  }

  function confirm() {
    deleteCar.mutate(undefined, {
      onSuccess: onDeleted,
      // Already gone: the goal is reached.
      onError: (error) => {
        if (isApiError(error) && error.code === "CAR_NOT_FOUND") onDeleted();
      },
    });
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (deleteCar.isPending) return;
        if (open) deleteCar.reset();
        setIsOpen(open);
      }}
    >
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon />
        {M.deleteCar}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{M.deleteCarTitle(plate)}</AlertDialogTitle>
          <AlertDialogDescription>{M.deleteCarDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        {deleteCar.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {carErrorMessage(isApiError(deleteCar.error) ? deleteCar.error.code : undefined)}
            </AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCar.isPending}>{M.cancel}</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={deleteCar.isPending}>
            {deleteCar.isPending && <Loader2Icon className="animate-spin" />}
            {deleteCar.isPending ? M.deleting : M.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
