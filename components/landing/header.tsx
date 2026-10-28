"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-border py-3 shadow-sm"
          : "bg-transparent border-transparent py-5"
      )}
    >
      {/* Grid de 3 colonnes pour un centrage parfait */}
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-3 items-center">
        {/* Colonne 1 : Logo */}
        <div className="flex justify-start">
          <Logo href="/" />
        </div>
        
        {/* Colonne 2 : Navigation Centrale */}
        <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">Comment ça marche</Link>
        </nav>

        {/* Colonne 3 : Boutons à droite */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Connexion
          </Link>
          <Link href="/auth/register" className={cn(buttonVariants({ size: "sm" }))}>
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </header>
  );
}