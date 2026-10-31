import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion — Loca",
};

export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="size-6 animate-spin mb-4" />
          <p className="text-sm">Chargement...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}