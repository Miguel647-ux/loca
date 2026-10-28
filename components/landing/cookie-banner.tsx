"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem("loca-cookie-consent");
    if (!consent) {
      // Petit délai pour ne pas agresser l'utilisateur à la milliseconde près
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("loca-cookie-consent", "accepted");
    setIsVisible(false);
  }

  function handleDecline() {
    localStorage.setItem("loca-cookie-consent", "declined");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="rounded-2xl border bg-background/95 backdrop-blur shadow-2xl p-5">
        <h3 className="font-heading font-semibold mb-2">Respect de votre vie privée</h3>
        <p className="text-sm text-muted-foreground mb-4">
          LOCA utilise des cookies essentiels au fonctionnement de la plateforme (connexion, sécurité). 
          Nous n'utilisons aucun cookie publicitaire ou de traçage externe.{" "}
          <Link href="/legal/privacy" className="text-[var(--brand)] underline underline-offset-4">
            En savoir plus
          </Link>
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={handleAccept} size="sm" className="flex-1">
            Accepter
          </Button>
          <Button onClick={handleDecline} variant="outline" size="sm" className="flex-1">
            Refuser
          </Button>
        </div>
      </div>
    </div>
  );
}