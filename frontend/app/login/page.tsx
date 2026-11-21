import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from "@/features/auth/components/app-logo";
import { LoginForm } from "@/features/auth/components/login-form";
import { AUTH_MESSAGES } from "@/features/auth/messages";

export const metadata: Metadata = {
  title: `${AUTH_MESSAGES.loginTitle} | ${AUTH_MESSAGES.appName}`,
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-1">
        <AppLogo />
        <p className="text-muted-foreground">{AUTH_MESSAGES.appTagline}</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{AUTH_MESSAGES.loginTitle}</CardTitle>
          <CardDescription>{AUTH_MESSAGES.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-muted-foreground">{AUTH_MESSAGES.loading}</p>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
