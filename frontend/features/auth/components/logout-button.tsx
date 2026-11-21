"use client";

import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "../hooks/use-logout";
import { AUTH_MESSAGES } from "../messages";

export function LogoutButton() {
  const logout = useLogout();

  return (
    <Button variant="ghost" onClick={logout}>
      <LogOutIcon />
      {AUTH_MESSAGES.logout}
    </Button>
  );
}
