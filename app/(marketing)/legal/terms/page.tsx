import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LandingHeader } from "@/components/landing/header";

export const metadata: Metadata = { title: "Conditions Générales d'Utilisation — Loca" };

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />
      <main className="flex-1 container mx-auto px-4 py-32 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft className="size-4" /> Retour à l'accueil
        </Link>
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-6">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          
          <h2 className="text-lg font-semibold text-foreground mt-8">1. Objet</h2>
          <p>LOCA est une plateforme SaaS de gestion locative. Elle permet aux propriétaires de gérer leurs biens et à leurs locataires de consulter leurs échéances et reçus.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">2. Accès au service</h2>
          <p>L'accès à la plateforme nécessite la création d'un compte. Vous êtes responsable de la confidentialité de vos identifiants.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">3. Responsabilités</h2>
          <p>Le propriétaire est seul responsable de l'exactitude des données qu'il renseigne (montants, dates, informations locataires). LOCA fournit l'outil technique mais n'intervient pas dans la relation contractuelle entre le bailleur et le locataire.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">4. Paiement et abonnement</h2>
          <p>LOCA est actuellement en phase de lancement. Les conditions tarifaires seront précisées ultérieurement.</p>
        </div>
      </main>
    </div>
  );
}