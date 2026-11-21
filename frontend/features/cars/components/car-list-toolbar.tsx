"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAR_SORT_KEYS, CAR_SORT_OPTIONS, type CarSortOption } from "../constants/car-sort";
import { CAR_MESSAGES } from "../messages";
import type { CarListParams } from "../schemas/car-list-params.schema";

const SEARCH_DEBOUNCE_MS = 300;

const SORT_ITEMS = CAR_SORT_KEYS.map((value) => ({ value, label: CAR_SORT_OPTIONS[value].label }));

type CarListToolbarProps = {
  params: CarListParams;
  brands: string[];
  onChange: (changes: Partial<CarListParams>) => void;
};

export function CarListToolbar({ params, brands, onChange }: CarListToolbarProps) {
  const urlSearch = params.search ?? "";
  const [draft, setDraft] = useState(urlSearch);

  // The URL is the source of truth. If it changes from outside ("clear search", back button),
  // follow it — adjusted during render, so it also holds when Next shows this page again.
  // Our own debounced update gives the same text, so the user's typing is left alone.
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);
  if (urlSearch !== syncedSearch) {
    setSyncedSearch(urlSearch);
    if (draft.trim() !== urlSearch) setDraft(urlSearch);
  }

  useEffect(() => {
    if (draft.trim() === urlSearch) return;
    const timer = setTimeout(() => onChange({ search: draft }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, urlSearch, onChange]);

  // Keep a selected brand visible even if its spelling differs from the list.
  const brandOptions =
    params.brand && !brands.some((brand) => brand.toLowerCase() === params.brand?.toLowerCase())
      ? [params.brand, ...brands]
      : brands;
  const brandItems = [
    { value: null, label: CAR_MESSAGES.allBrands },
    ...brandOptions.map((brand) => ({ value: brand, label: brand })),
  ];
  const selectedBrand =
    brandOptions.find((brand) => brand.toLowerCase() === params.brand?.toLowerCase()) ?? null;

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_12rem_12rem]">
      <Field>
        <FieldLabel htmlFor="car-search">{CAR_MESSAGES.searchLabel}</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            id="car-search"
            type="search"
            placeholder={CAR_MESSAGES.searchPlaceholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={100}
          />
        </InputGroup>
      </Field>

      <Field>
        <FieldLabel htmlFor="car-brand">{CAR_MESSAGES.brandLabel}</FieldLabel>
        <Select
          items={brandItems}
          value={selectedBrand}
          onValueChange={(brand) => onChange({ brand: brand ?? undefined })}
        >
          <SelectTrigger id="car-brand" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {brandItems.map((item) => (
              <SelectItem key={item.value ?? "all"} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="car-sort">{CAR_MESSAGES.sortLabel}</FieldLabel>
        <Select
          items={SORT_ITEMS}
          value={params.sort}
          onValueChange={(sort) => {
            if (sort) onChange({ sort: sort as CarSortOption });
          }}
        >
          <SelectTrigger id="car-sort" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
