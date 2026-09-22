import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthErrorPage() {
  return (
    <div className="space-y-6 text-center">
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Lien invalide ou expiré
      </h1>
      <p className="text-sm text-muted-foreground">
        Le lien que vous avez utilisé n’est plus valide. Veuillez réessayer
        depuis la page de connexion.
      </p>
      <Link
        href="/auth/login"
        className={cn(buttonVariants({ size: "lg" }))}
      >
        Retour à la connexion
      </Link>
    </div>
  );
}