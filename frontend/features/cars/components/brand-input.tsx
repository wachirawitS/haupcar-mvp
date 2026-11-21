"use client";

import type { ComponentProps } from "react";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/ui/autocomplete";
import { useCarBrands } from "../hooks/use-car-brands";
import { CAR_FORM_MESSAGES } from "../messages";

type BrandInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  isInvalid?: boolean;
  inputRef?: ComponentProps<"input">["ref"];
};

// Free text, with the brands already in the system as suggestions,
// so the team writes "Toyota" the same way every time.
export function BrandInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  isInvalid,
  inputRef,
}: BrandInputProps) {
  const brands = useCarBrands({ kind: "owner" });

  return (
    <Autocomplete
      items={brands.data ?? []}
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <AutocompleteInput
        id={id}
        ref={inputRef}
        placeholder={CAR_FORM_MESSAGES.brandPlaceholder}
        aria-invalid={isInvalid}
        onBlur={onBlur}
        maxLength={50}
        autoComplete="off"
        className="w-full"
      />
      <AutocompleteContent>
        <AutocompleteList>
          {(brand: string) => (
            <AutocompleteItem key={brand} value={brand}>
              {brand}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
