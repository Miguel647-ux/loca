"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link2, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { linkTenantAccount } from "@/actions/tenants";

export function LinkTenantButton({
  tenantId,
  isLinked,
}: {
  tenantId: string;
  isLinked: boolean;
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  if (isLinked) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 dark:bg-green-950/30 px-2.5 py-1.5 rounded-md">
        <CheckCircle2 className="size-3.5" /> Compte lié
      </span>
    );
  }

  async function handleLink() {
    setIsPending(true);
    const res = await linkTenantAccount(tenantId);
    setIsPending(false);

    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLink}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 mr-2 animate-spin" />
      ) : (
        <Link2 className="size-4 mr-2" />
      )}
      Lier le compte
    </Button>
  );
}