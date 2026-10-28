import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LandingHeader } from "@/components/landing/header";

export const metadata: Metadata = { title: "Mentions légales — Loca" };

export default function NoticesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />
      <main className="flex-1 container mx-auto px-4 py-32 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft className="size-4" /> Retour à l'accueil
        </Link>
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-6">Mentions légales</h1>
        
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <h2 className="text-lg font-semibold text-foreground">1. Éditeur du site</h2>
          <p>Le site LOCA est édité par Miguel AZIFAN.<br />
          Contact : <a href="mailto:azifanmiguel647@gmail.com" className="text-[var(--brand)] underline">azifanmiguel647@gmail.com</a><br />
          Téléphone : +229 01 53 66 48 91</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">2. Hébergement</h2>
          <p>Le site est hébergé par Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA).<br />
          Les données sont hébergées par Supabase Inc. (970 Toa Payoh North, #04-12, Singapore 318992).</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">3. Propriété intellectuelle</h2>
          <p>L'ensemble des contenus présents sur LOCA (textes, logos, interfaces, code) est la propriété exclusive de l'éditeur. Toute reproduction sans autorisation est interdite.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">4. Responsabilité</h2>
          <p>LOCA fournit un outil logiciel de gestion locative. L'éditeur ne saurait être tenu responsable de l'utilisation faite par les propriétaires et locataires des données saisies sur la plateforme.</p>
        </div>
      </main>
    </div>
  );
}