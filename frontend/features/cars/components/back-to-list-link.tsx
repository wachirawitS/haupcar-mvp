import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { CAR_FORM_MESSAGES } from "../messages";

export function BackToListLink() {
  return (
    <Link
      href="/cars"
      className="inline-flex items-center gap-1 self-start text-muted-foreground hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" />
      {CAR_FORM_MESSAGES.backToList}
    </Link>
  );
}
