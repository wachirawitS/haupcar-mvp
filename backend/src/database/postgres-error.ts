import { QueryFailedError } from 'typeorm';

const UNIQUE_VIOLATION = '23505';

// Duplicate keys are detected by PostgreSQL error code + constraint name,
// never by message text (§7.3).
export function isUniqueViolation(error: unknown, constraint: string): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driverError = error.driverError as {
    code?: unknown;
    constraint?: unknown;
  };
  return (
    driverError.code === UNIQUE_VIOLATION &&
    driverError.constraint === constraint
  );
}
