import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  type CarListParams,
  parseCarListParams,
  toCarListSearchParams,
} from "../schemas/car-list-params.schema";

// Page, search, brand and sort live in the URL, so the list survives refresh and can be shared (§4).
export function useCarListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => parseCarListParams(searchParams), [searchParams]);

  // Changing search, brand or sort starts again from page 1 unless a page is given.
  const setParams = useCallback(
    (changes: Partial<CarListParams>) => {
      const query = toCarListSearchParams({ ...params, page: 1, ...changes }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return { params, setParams };
}
