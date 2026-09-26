"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UNIT_STATUSES,
  UNIT_STATUS_LABELS,
  UNIT_TYPES,
  UNIT_TYPE_LABELS,
} from "@/lib/validations/unit";

export function UnitFilters({ propertyId }: { propertyId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const initialQ = searchParams.get("q") ?? "";
  const initialStatus = searchParams.get("status") ?? "all";
  const initialType = searchParams.get("unit_type") ?? "all";

  const [q, setQ] = useState(initialQ);

  useEffect(() => setQ(initialQ), [initialQ]);

  useEffect(() => {
    const trimmed = q.trim();
    const current = searchParams.get("q") ?? "";
    if (trimmed === current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setParam(key: string, value: string, defaultValue = "all") {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) params.delete(key);
    else params.set(key, value);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher par numéro…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 pr-9"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Effacer"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" className="justify-between sm:w-44" />
          }
        >
          {initialStatus === "all"
            ? "Tous les statuts"
            : UNIT_STATUS_LABELS[
                initialStatus as keyof typeof UNIT_STATUS_LABELS
              ] ?? "Tous les statuts"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setParam("status", "all")}>
            Tous les statuts
          </DropdownMenuItem>
          {UNIT_STATUSES.map((s) => (
            <DropdownMenuItem key={s} onClick={() => setParam("status", s)}>
              {UNIT_STATUS_LABELS[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" className="justify-between sm:w-44" />
          }
        >
          {initialType === "all"
            ? "Tous les types"
            : UNIT_TYPE_LABELS[initialType as keyof typeof UNIT_TYPE_LABELS] ??
              "Tous les types"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setParam("unit_type", "all")}>
            Tous les types
          </DropdownMenuItem>
          {UNIT_TYPES.map((t) => (
            <DropdownMenuItem key={t} onClick={() => setParam("unit_type", t)}>
              {UNIT_TYPE_LABELS[t]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}