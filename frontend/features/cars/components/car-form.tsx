"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api-error";
import { CAR_COLOR_LABELS } from "../constants/car-colors";
import { CAR_FORM_MESSAGES as M, carErrorMessage, carFieldErrorMessage } from "../messages";
import {
  carFormSchema,
  type CarFormOutput,
  type CarFormValues,
  isCarFormField,
  MODEL_MAX_LENGTH,
  NOTES_MAX_LENGTH,
} from "../schemas/car-form.schema";
import { BrandInput } from "./brand-input";
import { ProvinceCombobox } from "./province-combobox";

const COLOR_ITEMS = [
  { value: null, label: M.colorNone },
  ...Object.entries(CAR_COLOR_LABELS).map(([value, label]) => ({ value, label })),
];

type Form = UseFormReturn<CarFormValues, unknown, CarFormOutput>;

// Server errors (§5.4): known fields inline, anything else in one form-level Alert.
function showServerError(form: Form, error: unknown) {
  if (isApiError(error) && error.fieldErrors) {
    const entries = Object.entries(error.fieldErrors);
    const unknown = entries.filter(([name]) => !isCarFormField(name));
    for (const [name, errors] of entries) {
      if (isCarFormField(name) && errors[0]) {
        form.setError(
          name,
          { message: carFieldErrorMessage(errors[0].code) },
          { shouldFocus: true },
        );
      }
    }
    if (unknown.length > 0) form.setError("root.server", { message: M.invalidValue });
    return;
  }
  form.setError("root.server", {
    message: carErrorMessage(isApiError(error) ? error.code : undefined),
  });
}

type CarFormProps = {
  defaultValues: CarFormValues;
  // Resolves with the values to reset to (Next keeps this page alive after leaving it).
  onSubmit: (body: CarFormOutput) => Promise<CarFormValues>;
  // Extra content between the fields and the buttons (the photo picker on the add page).
  children?: ReactNode;
};

// The car fields, shared by the add and edit pages.
export function CarForm({ defaultValues, onSubmit, children }: CarFormProps) {
  const form: Form = useForm<CarFormValues, unknown, CarFormOutput>({
    resolver: zodResolver(carFormSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { isSubmitting, errors } = form.formState;

  async function onValid(body: CarFormOutput) {
    try {
      form.reset(await onSubmit(body));
    } catch (error) {
      // Keep the user's input (§5.3).
      showServerError(form, error);
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onValid)}>
      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Controller
            name="registrationNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="car-registration-number">
                  {M.registrationNumberLabel}
                </FieldLabel>
                <Input
                  {...field}
                  id="car-registration-number"
                  autoComplete="off"
                  maxLength={20}
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>{M.registrationNumberHint}</FieldDescription>
                )}
              </Field>
            )}
          />

          <Controller
            name="province"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="car-province">{M.provinceLabel}</FieldLabel>
                <ProvinceCombobox
                  id="car-province"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  isInvalid={fieldState.invalid}
                  disabled={isSubmitting}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="brand"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="car-brand-input">{M.brandLabel}</FieldLabel>
                <BrandInput
                  id="car-brand-input"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  isInvalid={fieldState.invalid}
                  disabled={isSubmitting}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="model"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="car-model">{M.modelLabel}</FieldLabel>
                <Input
                  {...field}
                  id="car-model"
                  placeholder={M.modelPlaceholder}
                  autoComplete="off"
                  maxLength={MODEL_MAX_LENGTH}
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="year"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="car-year">
                  {M.yearLabel}{" "}
                  <span className="font-normal text-muted-foreground">{M.optional}</span>
                </FieldLabel>
                <Input
                  {...field}
                  id="car-year"
                  inputMode="numeric"
                  placeholder={M.yearPlaceholder}
                  autoComplete="off"
                  maxLength={4}
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="color"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="car-color">
                  {M.colorLabel}{" "}
                  <span className="font-normal text-muted-foreground">{M.optional}</span>
                </FieldLabel>
                <Select
                  items={COLOR_ITEMS}
                  value={field.value || null}
                  onValueChange={(color) => field.onChange(color ?? "")}
                  disabled={isSubmitting}
                  inputRef={field.ref}
                >
                  <SelectTrigger
                    id="car-color"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_ITEMS.map((item) => (
                      <SelectItem key={item.value ?? "none"} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="car-notes">
                {M.notesLabel}{" "}
                <span className="font-normal text-muted-foreground">{M.optional}</span>
              </FieldLabel>
              <Textarea
                {...field}
                id="car-notes"
                rows={3}
                maxLength={NOTES_MAX_LENGTH}
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {children}

        {errors.root?.server && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>
              {M.saveError}: {errors.root.server.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" render={<Link href="/cars" />} nativeButton={false}>
            {M.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {isSubmitting ? M.saving : M.save}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
