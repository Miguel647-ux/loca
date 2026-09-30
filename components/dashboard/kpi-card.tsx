import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "default",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: "default" | "brand" | "destructive";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 flex flex-col gap-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {Icon && (
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-md",
              accent === "brand"
                ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                : accent === "destructive"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-3.5" />
          </div>
        )}
      </div>
      <p
        className={cn(
          "font-heading text-2xl font-semibold tabular-nums",
          accent === "brand" ? "text-[var(--brand)]" : "",
          accent === "destructive" ? "text-destructive" : ""
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="text-[10px] text-muted-foreground -mt-1">{hint}</p>
      )}
    </div>
  );
}