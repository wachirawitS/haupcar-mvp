import { VanIcon } from "lucide-react";
import { AUTH_MESSAGES } from "../messages";

export function AppLogo() {
  return (
    <span className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
        <VanIcon className="size-5" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight">{AUTH_MESSAGES.appName}</span>
    </span>
  );
}
