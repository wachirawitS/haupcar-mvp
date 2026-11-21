import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrCreateShareLink, revokeShareLink } from "../api/share-link-api";
import type { ShareLink } from "../types";

const SHARE_LINK_KEY = ["share-link"] as const;

// "Get or create" is idempotent, so it is read like a query while the dialog is open.
export function useShareLink(isEnabled: boolean) {
  return useQuery({
    queryKey: SHARE_LINK_KEY,
    queryFn: getOrCreateShareLink,
    enabled: isEnabled,
    staleTime: Infinity,
  });
}

// New link = revoke the old one, then create a fresh one.
export function useResetShareLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<ShareLink> => {
      await revokeShareLink();
      return getOrCreateShareLink();
    },
    onSuccess: (link) => queryClient.setQueryData(SHARE_LINK_KEY, link),
  });
}
