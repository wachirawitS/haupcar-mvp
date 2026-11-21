import { CarFrontIcon } from "lucide-react";
import Image from "next/image";
import { CAR_MESSAGES } from "../messages";
import type { CarImage } from "../types";

// Fixed size so rows do not jump while images load.
// unoptimized: MinIO URLs are already public, and the Next server cannot reach them in Docker.
export function CarThumbnail({ image, plate }: { image: CarImage | null; plate: string }) {
  if (!image) {
    return (
      <div
        className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
        title={CAR_MESSAGES.noPhoto}
      >
        <CarFrontIcon aria-hidden />
        <span className="sr-only">{CAR_MESSAGES.noPhoto}</span>
      </div>
    );
  }
  return (
    <Image
      src={image.url}
      alt={CAR_MESSAGES.photoAlt(plate, 1)}
      width={64}
      height={48}
      unoptimized
      className="h-12 w-16 shrink-0 rounded-md bg-muted object-cover"
    />
  );
}
