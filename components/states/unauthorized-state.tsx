import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UnauthorizedState({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border bg-card px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <ShieldAlert className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-lg font-semibold">Accès refusé</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Vous n’avez pas les permissions nécessaires pour accéder à cette
          ressource.
        </p>
      </div>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline" }), "mt-2")}
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}