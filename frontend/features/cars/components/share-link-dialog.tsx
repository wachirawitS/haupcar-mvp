"use client";

import { CircleAlertIcon, CopyIcon, Loader2Icon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api-error";
import { useResetShareLink, useShareLink } from "../hooks/use-share-link";
import { CAR_MESSAGES, carErrorMessage } from "../messages";

function errorCode(error: unknown): string | undefined {
  return isApiError(error) ? error.code : undefined;
}

export function ShareLinkDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const shareLink = useShareLink(isOpen);
  const resetLink = useResetShareLink();

  const url =
    shareLink.data && typeof window !== "undefined"
      ? `${window.location.origin}/shared/${shareLink.data.token}`
      : "";

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setIsConfirmingReset(false);
      resetLink.reset();
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(CAR_MESSAGES.linkCopied);
    } catch {
      toast.error(CAR_MESSAGES.copyFailed);
    }
  }

  function createNewLink() {
    resetLink.mutate(undefined, {
      onSuccess: () => {
        setIsConfirmingReset(false);
        toast.success(CAR_MESSAGES.newLinkCreated);
      },
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Share2Icon />
        {CAR_MESSAGES.share}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{CAR_MESSAGES.shareTitle}</DialogTitle>
          <DialogDescription>{CAR_MESSAGES.shareDescription}</DialogDescription>
        </DialogHeader>

        {shareLink.isPending && <Skeleton className="h-14 w-full" />}

        {shareLink.isError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>
              {CAR_MESSAGES.shareLoadError}: {carErrorMessage(errorCode(shareLink.error))}
            </AlertDescription>
            <AlertAction>
              <Button size="sm" variant="outline" onClick={() => void shareLink.refetch()}>
                {CAR_MESSAGES.retry}
              </Button>
            </AlertAction>
          </Alert>
        )}

        {shareLink.data && (
          <Field>
            <FieldLabel htmlFor="share-link-url">{CAR_MESSAGES.shareLinkLabel}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="share-link-url"
                readOnly
                value={url}
                onFocus={(event) => event.target.select()}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={() => void copyLink()}>
                  <CopyIcon />
                  {CAR_MESSAGES.copyLink}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}

        {isConfirmingReset && (
          <Alert>
            <CircleAlertIcon />
            <AlertDescription>{CAR_MESSAGES.newLinkConfirm}</AlertDescription>
          </Alert>
        )}

        {resetLink.isError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{carErrorMessage(errorCode(resetLink.error))}</AlertDescription>
          </Alert>
        )}

        {shareLink.data && (
          <DialogFooter>
            {isConfirmingReset ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmingReset(false)}
                  disabled={resetLink.isPending}
                >
                  {CAR_MESSAGES.cancel}
                </Button>
                <Button
                  variant="destructive"
                  onClick={createNewLink}
                  disabled={resetLink.isPending}
                >
                  {resetLink.isPending && <Loader2Icon className="animate-spin" />}
                  {CAR_MESSAGES.newLinkConfirmButton}
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setIsConfirmingReset(true)}>
                {CAR_MESSAGES.newLink}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
