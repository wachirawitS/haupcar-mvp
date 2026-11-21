import { ValidateBy, type ValidationOptions } from 'class-validator';

// Car field rules (ADR-0016), shared by the create and update DTOs.
// The frontend schema mirrors these.

export const REGISTRATION_NUMBER_MAX_LENGTH = 20;
export const BRAND_MAX_LENGTH = 50;
export const MODEL_MAX_LENGTH = 50;
export const NOTES_MAX_LENGTH = 1000;
export const MIN_CAR_YEAR = 1950;

// Canonical Thai plate: optional 1–2 digits + 1–3 Thai letters, one space, 1–4 digits.
// e.g. "1กข 1234", "กข 99", "ก 1".
export const REGISTRATION_NUMBER_PATTERN = /^\d{0,2}[ก-ฮ]{1,3} \d{1,4}$/;
const PLATE_PARTS = /^(\d{0,2}[ก-ฮ]{1,3})(\d{1,4})$/;

export function trimText(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

// "1กข1234", "1กข-1234", " 1กข  1234 " → "1กข 1234", so spacing cannot create duplicates.
// Anything that does not look like a plate is returned trimmed and fails the pattern check.
export function normalizeRegistrationNumber(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const match = PLATE_PARTS.exec(value.replace(/[\s-]/g, ''));
  return match ? `${match[1]} ${match[2]}` : value.trim();
}

// Empty notes mean "no notes".
export function normalizeNotes(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

// Upper bound moves with the calendar, so it is checked at request time.
export function IsNotFutureCarYear(
  options?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'maxCarYear',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'number' && value <= new Date().getFullYear() + 1,
        defaultMessage: () => '$property must not be later than next year',
      },
    },
    options,
  );
}
