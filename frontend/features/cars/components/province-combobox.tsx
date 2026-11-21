"use client";

import type { ComponentProps } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { PROVINCES } from "../constants/provinces";
import { CAR_FORM_MESSAGES } from "../messages";

type ProvinceComboboxProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  isInvalid?: boolean;
  inputRef?: ComponentProps<"input">["ref"];
};

// Type to filter the 77 provinces; only a listed province can be chosen (§5.2).
export function ProvinceCombobox({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  isInvalid,
  inputRef,
}: ProvinceComboboxProps) {
  return (
    <Combobox
      items={PROVINCES}
      value={value || null}
      onValueChange={(province) => onChange(province ?? "")}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        ref={inputRef}
        placeholder={CAR_FORM_MESSAGES.provincePlaceholder}
        aria-invalid={isInvalid}
        onBlur={onBlur}
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>{CAR_FORM_MESSAGES.provinceEmpty}</ComboboxEmpty>
        <ComboboxList>
          {(province: string) => (
            <ComboboxItem key={province} value={province}>
              {province}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
