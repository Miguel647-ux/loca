import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight">
          Loca
        </h1>
        <p className="text-muted-foreground text-lg">
          La plateforme de gestion locative simple, sécurisée et moderne.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Link
            href="/auth/register"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Créer un compte
          </Link>
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}