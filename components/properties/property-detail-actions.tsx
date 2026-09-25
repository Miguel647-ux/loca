"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArchivePropertyDialog } from "./archive-property-dialog";

export function PropertyDetailActions({
  propertyId,
  propertyName,
  isArchived,
}: {
  propertyId: string;
  propertyName: string;
  isArchived: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/properties/${propertyId}/edit`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Pencil className="size-4" />
        Modifier
      </Link>
      <ArchivePropertyDialog
        propertyId={propertyId}
        propertyName={propertyName}
        isArchived={isArchived}
      />
    </div>
  );
}