// Same limits as the backend (storage.config.ts: CAR_IMAGES_MAX, IMAGE_MAX_BYTES).
export const CAR_IMAGES_MAX = 10;
export const CAR_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const CAR_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
