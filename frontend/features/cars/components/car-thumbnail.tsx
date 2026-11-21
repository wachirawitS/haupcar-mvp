import { CarFrontIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CAR_MESSAGES } from "../messages";
import type { CarImage } from "../types";

// Fixed size so rows do not jump while images load.
// unoptimized: MinIO URLs are already public, and the Next server cannot reach them in Docker.
const SIZES = {
  sm: { box: "h-8 w-11", icon: "size-4", width: 44, height: 32 },
  md: { box: "h-12 w-16", icon: "size-6", width: 64, height: 48 },
};

export function CarThumbnail({
  image,
  plate,
  size = "md",
}: {
  image: CarImage | null;
  plate: string;
  size?: keyof typeof SIZES;
}) {
  const { box, icon, width, height } = SIZES[size];
  if (!image) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
          box,
        )}
        title={CAR_MESSAGES.noPhoto}
      >
        <CarFrontIcon className={icon} aria-hidden />
        <span className="sr-only">{CAR_MESSAGES.noPhoto}</span>
      </div>
    );
  }
  return (
    <Image
      src={image.url}
      alt={CAR_MESSAGES.photoAlt(plate, 1)}
      width={width}
      height={height}
      unoptimized
      className={cn("shrink-0 rounded-md bg-muted object-cover", box)}
    />
  );
}
