"use client";

import { ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api-error";
import { CAR_IMAGE_MAX_BYTES, CAR_IMAGE_TYPES, CAR_IMAGES_MAX } from "../constants/car-images";
import { useDeleteCarImage, useUploadCarImages } from "../hooks/use-car-mutations";
import { CAR_FORM_MESSAGES as M, carImageErrorMessage } from "../messages";
import type { CarImage } from "../types";

// Same limits as the backend, checked before uploading (§5.5).
function checkPickedFiles(files: File[], currentCount: number) {
  const errors: string[] = [];
  const accepted: File[] = [];
  for (const file of files) {
    if (!(CAR_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      errors.push(M.photoWrongType(file.name));
    } else if (file.size > CAR_IMAGE_MAX_BYTES) {
      errors.push(M.photoTooLarge(file.name));
    } else if (currentCount + accepted.length >= CAR_IMAGES_MAX) {
      errors.push(M.photoLimit(CAR_IMAGES_MAX));
      break;
    } else {
      accepted.push(file);
    }
  }
  return { accepted, errors };
}

function errorCode(error: unknown) {
  return isApiError(error) ? error.code : undefined;
}

type Tile = { key: string; alt: string } & ({ src: string } | { file: File });

// Local preview of a picked file. The object URL is made when the <img> mounts and
// revoked when it unmounts, so nothing leaks and nothing is held in state.
function FilePreview({ file, alt }: { file: File; alt: string }) {
  const attachPreview = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;
      const url = URL.createObjectURL(file);
      img.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [file],
  );
  // eslint-disable-next-line @next/next/no-img-element -- blob: preview, next/image cannot load it
  return <img ref={attachPreview} alt={alt} className="size-full object-cover" />;
}

type GalleryViewProps = {
  title: string;
  hint: string;
  tiles: Tile[];
  pendingCount: number;
  disabled: boolean;
  onPick: (files: File[]) => void;
  onRemove: (key: string) => void;
};

function GalleryView({
  title,
  hint,
  tiles,
  pendingCount,
  disabled,
  onPick,
  onRemove,
}: GalleryViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickErrors, setPickErrors] = useState<string[]>([]);
  const count = tiles.length + pendingCount;
  const isFull = count >= CAR_IMAGES_MAX;

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const { accepted, errors } = checkPickedFiles([...(event.target.files ?? [])], count);
    event.target.value = ""; // picking the same file again still fires change
    setPickErrors(errors);
    if (accepted.length > 0) onPick(accepted);
  }

  return (
    <Field data-invalid={pickErrors.length > 0}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <FieldLabel htmlFor="car-photos">{title}</FieldLabel>
        <span className="text-muted-foreground">{M.photosCount(count, CAR_IMAGES_MAX)}</span>
      </div>
      <FieldDescription>
        {hint} · {M.photosRules}
      </FieldDescription>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {tiles.map((tile, index) => (
          <li key={tile.key} className="relative aspect-4/3 overflow-hidden rounded-md bg-muted">
            {"file" in tile ? (
              <FilePreview file={tile.file} alt={tile.alt} />
            ) : (
              <Image
                src={tile.src}
                alt={tile.alt}
                fill
                unoptimized
                sizes="200px"
                className="object-cover"
              />
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon-xs"
              className="absolute top-1 right-1"
              aria-label={M.removePhoto(index + 1)}
              disabled={disabled}
              onClick={() => onRemove(tile.key)}
            >
              <XIcon />
            </Button>
          </li>
        ))}
        {Array.from({ length: pendingCount }, (_, index) => (
          <li key={`pending-${index}`} className="relative aspect-4/3" aria-label={M.uploading}>
            <Skeleton className="size-full" />
            <Loader2Icon className="absolute inset-0 m-auto animate-spin text-muted-foreground" />
          </li>
        ))}
      </ul>
      <input
        ref={inputRef}
        id="car-photos"
        type="file"
        accept={CAR_IMAGE_TYPES.join(",")}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={handlePick}
        disabled={disabled || isFull}
      />
      <div>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isFull}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlusIcon />
          {M.addPhotos}
        </Button>
      </div>
      {pickErrors.length > 0 && <FieldError errors={pickErrors.map((message) => ({ message }))} />}
    </Field>
  );
}

// A stable key per picked File, so removing one photo does not rebuild the other previews.
const fileKeys = new WeakMap<File, string>();
let nextFileKey = 0;
function fileKey(file: File): string {
  let key = fileKeys.get(file);
  if (!key) {
    key = `file-${nextFileKey++}`;
    fileKeys.set(file, key);
  }
  return key;
}

// Add page: photos stay in the browser until the car is saved.
export function LocalCarImageGallery({
  files,
  onFilesChange,
  disabled = false,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const keyed = files.map((file) => ({ file, key: fileKey(file) }));
  return (
    <GalleryView
      title={M.photosTitle}
      hint={M.photosHintCreate}
      tiles={keyed.map(({ file, key }, index) => ({
        key,
        file,
        alt: `${M.photosTitle} ${index + 1}`,
      }))}
      pendingCount={0}
      disabled={disabled}
      onPick={(picked) => onFilesChange([...files, ...picked])}
      onRemove={(key) =>
        onFilesChange(keyed.filter((item) => item.key !== key).map((item) => item.file))
      }
    />
  );
}

// Edit page: every change is saved right away (§5.5).
export function RemoteCarImageGallery({
  carId,
  plate,
  images,
  onUploaded,
}: {
  carId: string;
  plate: string;
  images: CarImage[];
  onUploaded?: () => void;
}) {
  const upload = useUploadCarImages(carId);
  const remove = useDeleteCarImage(carId);
  const [imageToDelete, setImageToDelete] = useState<CarImage | null>(null);

  function uploadFiles(files: File[]) {
    upload.mutate(files, {
      onSuccess: () => {
        toast.success(M.uploaded);
        onUploaded?.();
      },
      onError: (error) => toast.error(carImageErrorMessage(errorCode(error))),
    });
  }

  function confirmDelete() {
    if (!imageToDelete) return;
    remove.mutate(imageToDelete.id, {
      onSuccess: () => {
        setImageToDelete(null);
        toast.success(M.photoDeleted);
      },
    });
  }

  return (
    <>
      <GalleryView
        title={M.photosTitle}
        hint={M.photosHintEdit}
        tiles={images.map((image, index) => ({
          key: image.id,
          src: image.url,
          alt: `รูปรถทะเบียน ${plate} รูปที่ ${index + 1}`,
        }))}
        pendingCount={upload.isPending ? upload.variables.length : 0}
        disabled={upload.isPending}
        onPick={uploadFiles}
        onRemove={(id) => {
          remove.reset();
          setImageToDelete(images.find((image) => image.id === id) ?? null);
        }}
      />
      <AlertDialog
        open={imageToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setImageToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{M.deletePhotoTitle}</AlertDialogTitle>
            <AlertDialogDescription>{M.deletePhotoDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          {remove.isError && (
            <Alert variant="destructive">
              <AlertDescription>{carImageErrorMessage(errorCode(remove.error))}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>{M.cancel}</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending && <Loader2Icon className="animate-spin" />}
              {M.delete}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
