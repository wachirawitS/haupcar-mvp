import { Suspense } from "react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { AUTH_MESSAGES } from "@/features/auth/messages";

export default function CarsLayout({ children }: LayoutProps<"/cars">) {
  return (
    <Suspense fallback={<p className="p-6 text-muted-foreground">{AUTH_MESSAGES.loading}</p>}>
      <RequireAuth>
        <header className="border-b">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <span className="font-semibold">{AUTH_MESSAGES.appName}</span>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
      </RequireAuth>
    </Suspense>
  );
}
