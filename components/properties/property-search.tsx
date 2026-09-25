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

const STATUS_LABELS: Record<string, string> = {
  active: "Actives",
  archived: "Archivées",
  all: "Toutes",
};

export function PropertySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialQ = searchParams.get("q") ?? "";
  const initialStatus = searchParams.get("status") ?? "active";

  const [q, setQ] = useState(initialQ);

  // Sync si l'URL change (navigation externe)
  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  // Debounce la recherche : update URL après 300ms sans frappe
  useEffect(() => {
    const trimmed = q.trim();
    const current = searchParams.get("q") ?? "";
    if (trimmed === current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("page"); // reset page à 1
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "active") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function clearSearch() {
    setQ("");
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher par nom, ville, adresse…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 pr-9"
        />
        {q && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Effacer la recherche"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" className="justify-between sm:w-40" />
          }
        >
          {STATUS_LABELS[initialStatus] ?? "Actives"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setStatus("active")}>
            Actives
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatus("archived")}>
            Archivées
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatus("all")}>
            Toutes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}