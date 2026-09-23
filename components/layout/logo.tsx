import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-heading text-xl font-bold tracking-tight",
        className
      )}
    >
      Loca
    </Link>
  );
}