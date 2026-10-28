"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GoogleIcon } from "./google-icon";

export function GoogleAuthButton() {
  const [isPending, setIsPending] = useState(false);
  const supabase = createClient();

  async function handleGoogleLogin() {
    setIsPending(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // L'URL de retour vers notre app
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
      // Supabase redirige automatiquement vers Google, pas besoin de faire plus.
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la connexion avec Google.");
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={isPending}
      className="w-full bg-background hover:bg-muted/50"
    >
      {isPending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <GoogleIcon className="mr-2 size-4" />
      )}
      Continuer avec Google
    </Button>
  );
}