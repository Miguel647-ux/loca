import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ErrorState({
  title = "Une erreur est survenue",
  description = "Veuillez réessayer dans un instant.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border bg-card px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}