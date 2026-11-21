"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { browser } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { isApiError } from "@/lib/api-error";
import { useIsLoggedIn } from "../hooks/use-is-logged-in";
import { useLogin } from "../hooks/use-login";
import { AUTH_MESSAGES, fieldErrorMessage, loginErrorMessage } from "../messages";
import { loginFormSchema, type LoginFormValues } from "../schemas/login-form.schema";
import { nextPathSchema } from "../schemas/next-path.schema";

const FORM_FIELDS = ["username", "password"] as const;

function isFormField(name: string): name is keyof LoginFormValues {
  return (FORM_FIELDS as readonly string[]).includes(name);
}

// 422 where every field error belongs to an input: show them inline, not in the alert (§5.4).
function getInlineFieldErrors(error: unknown) {
  if (!isApiError(error) || !error.fieldErrors) return null;
  const entries = Object.entries(error.fieldErrors);
  return entries.every(([name]) => isFormField(name)) ? entries : null;
}

export function LoginForm() {
  // The token lives in localStorage, so this renders only in the browser.
  use(browser("Login redirects when a token is already in localStorage."));

  const router = useRouter();
  const nextPath = nextPathSchema.parse(useSearchParams().get("next") ?? "");
  const isLoggedIn = useIsLoggedIn();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
  });

  // Already logged in, or just logged in → go on. Runs again whenever this page is shown.
  useEffect(() => {
    if (isLoggedIn) router.replace(nextPath);
  }, [isLoggedIn, nextPath, router]);

  if (isLoggedIn) return null;

  function onValid(values: LoginFormValues) {
    loginMutation.mutate(values, {
      // Next.js keeps this page alive after leaving it; do not keep the password around.
      onSuccess: () => {
        form.reset();
        setIsPasswordVisible(false);
      },
      onError: (error) => {
        for (const [name, errors] of getInlineFieldErrors(error) ?? []) {
          if (isFormField(name) && errors[0]) {
            form.setError(name, { message: fieldErrorMessage(name, errors[0].code) });
          }
        }
      },
    });
  }

  const { error } = loginMutation;
  const alertMessage =
    error && !getInlineFieldErrors(error)
      ? loginErrorMessage(isApiError(error) ? error.code : "")
      : null;

  return (
    <form noValidate onSubmit={form.handleSubmit(onValid)}>
      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-username">{AUTH_MESSAGES.usernameLabel}</FieldLabel>
              <Input
                {...field}
                id="login-username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">{AUTH_MESSAGES.passwordLabel}</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id="login-password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={
                      isPasswordVisible ? AUTH_MESSAGES.hidePassword : AUTH_MESSAGES.showPassword
                    }
                    aria-pressed={isPasswordVisible}
                    onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
                  >
                    {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Wrong login: one alert near the button, not saying which field was wrong (§7). */}
        {alertMessage && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" disabled={loginMutation.isPending}>
          {loginMutation.isPending && <Loader2Icon className="animate-spin" />}
          {loginMutation.isPending ? AUTH_MESSAGES.submitting : AUTH_MESSAGES.submit}
        </Button>
      </FieldGroup>
    </form>
  );
}
