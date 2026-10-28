import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LandingHeader } from "@/components/landing/header";

export const metadata: Metadata = { title: "Politique de confidentialité — Loca" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />
      <main className="flex-1 container mx-auto px-4 py-32 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft className="size-4" /> Retour à l'accueil
        </Link>
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-6">Politique de confidentialité</h1>
        
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          
          <h2 className="text-lg font-semibold text-foreground mt-8">1. Collecte des données</h2>
          <p>LOCA collecte uniquement les données nécessaires à la gestion locative : noms, coordonnées, informations relatives aux propriétés et aux baux. Aucune donnée financière sensible n'est stockée directement sur notre serveur.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">2. Utilisation des données</h2>
          <p>Vos données sont utilisées pour vous fournir le service : gestion des baux, suivi des paiements, génération de reçus. Elles ne sont jamais vendues à des tiers.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">3. Hébergement et sécurité</h2>
          <p>Les données sont hébergées sur Supabase (PostgreSQL) avec des règles de sécurité strictes (RLS). Chaque propriétaire ne peut voir que ses propres données, et chaque locataire ne voit que ses propres informations.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">4. Vos droits</h2>
          <p>Conformément aux réglementations en vigueur (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous par email à <strong>azifanmiguel647@gmail.com</strong>.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">5. Utilisation des cookies</h2>
          <p>LOCA utilise uniquement des <strong>cookies techniques (strictement nécessaires)</strong> pour gérer l'authentification, la session utilisateur et la sécurité de la plateforme. Ces cookies sont indispensables au fonctionnement du service.</p>
          <p>Nous n'utilisons <strong>aucun cookie publicitaire, analytique ou de traçage tiers</strong>. Aucun consentement n'est requis pour les cookies techniques, mais nous vous informons de leur présence par souci de transparence.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">6. Contact</h2>
          <p>Pour toute question relative à vos données personnelles, vous pouvez nous écrire à : <a href="mailto:azifanmiguel647@gmail.com" className="text-[var(--brand)] underline">azifanmiguel647@gmail.com</a>.</p>
        </div>
      </main>
    </div>
  );
}