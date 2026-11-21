import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { AUTH_MESSAGES } from "@/features/auth/messages";

export const metadata: Metadata = {
  title: `${AUTH_MESSAGES.loginTitle} | ${AUTH_MESSAGES.appName}`,
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
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
