import { z } from "zod";
import { CAR_COLOR_LABELS } from "../constants/car-colors";
import { PROVINCES } from "../constants/provinces";
import { CAR_FORM_MESSAGES as M } from "../messages";
import type { Car, CarColor } from "../types";

// Mirrors the backend car rules (car-field.rules.ts, create-car.dto.ts, ADR-0016).
// The backend is still the authority; this gives instant feedback.
export const BRAND_MAX_LENGTH = 50;
export const MODEL_MAX_LENGTH = 50;
export const NOTES_MAX_LENGTH = 1000;
export const MIN_CAR_YEAR = 1950;
export const maxCarYear = () => new Date().getFullYear() + 1;

const PLATE_PATTERN = /^\d{0,2}[ก-ฮ]{1,3} \d{1,4}$/;
const PLATE_PARTS = /^(\d{0,2}[ก-ฮ]{1,3})(\d{1,4})$/;

// "1กข1234", "1กข-1234", " 1กข  1234 " → "1กข 1234" (same as the backend).
export function normalizeRegistrationNumber(value: string): string {
  const match = PLATE_PARTS.exec(value.replace(/[\s-]/g, ""));
  return match ? `${match[1]} ${match[2]}` : value.trim();
}

const CAR_COLORS = Object.keys(CAR_COLOR_LABELS) as [CarColor, ...CarColor[]];

const requiredText = (max: number) => z.string().trim().min(1, M.required).max(max, M.tooLong(max));

// Form values are what the inputs hold (strings); the parsed output is the API body.
export const carFormSchema = z.object({
  registrationNumber: z
    .string()
    .transform(normalizeRegistrationNumber)
    .pipe(
      z.string().min(1, { error: M.required, abort: true }).regex(PLATE_PATTERN, M.plateFormat),
    ),
  province: z
    .string()
    .refine((value) => value !== "", M.required)
    .pipe(z.enum(PROVINCES, M.invalidValue)),
  brand: requiredText(BRAND_MAX_LENGTH),
  model: requiredText(MODEL_MAX_LENGTH),
  year: z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value === "") return null;
      const year = Number(value);
      if (!/^\d+$/.test(value) || year < MIN_CAR_YEAR || year > maxCarYear()) {
        ctx.addIssue({ code: "custom", message: M.yearRange(MIN_CAR_YEAR, maxCarYear()) });
        return z.NEVER;
      }
      return year;
    }),
  color: z.union([z.literal("").transform(() => null), z.enum(CAR_COLORS, M.invalidValue)]),
  notes: z
    .string()
    .trim()
    .max(NOTES_MAX_LENGTH, M.tooLong(NOTES_MAX_LENGTH))
    .transform((value) => value || null),
});

export type CarFormValues = z.input<typeof carFormSchema>;
export type CarFormOutput = z.output<typeof carFormSchema>;

export const EMPTY_CAR_FORM: CarFormValues = {
  registrationNumber: "",
  province: "",
  brand: "",
  model: "",
  year: "",
  color: "",
  notes: "",
};

export function carToFormValues(car: Car): CarFormValues {
  return {
    registrationNumber: car.registrationNumber,
    province: car.province,
    brand: car.brand,
    model: car.model,
    year: car.year === null ? "" : String(car.year),
    color: car.color ?? "",
    notes: car.notes ?? "",
  };
}

export const CAR_FORM_FIELDS = Object.keys(EMPTY_CAR_FORM) as (keyof CarFormValues)[];

export function isCarFormField(name: string): name is keyof CarFormValues {
  return (CAR_FORM_FIELDS as string[]).includes(name);
}
