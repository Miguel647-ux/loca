import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Mail, Phone } from "lucide-react";
import { LandingHeader } from "@/components/landing/header";

export const metadata: Metadata = { title: "Contact — Loca" };

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />
      <main className="flex-1 container mx-auto px-4 py-32 max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft className="size-4" /> Retour à l'accueil
        </Link>
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-6">Contactez-nous</h1>
        <p className="text-muted-foreground mb-12">
          Une question, un problème technique ou une demande de partenariat ? Notre équipe vous répond.
        </p>

        <div className="grid gap-4">
          <div className="rounded-xl border bg-card p-6 flex items-start gap-4">
            <div className="size-10 rounded-full bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
              <Mail className="size-5 text-[var(--brand)]" />
            </div>
            <div>
              <p className="font-medium mb-1">Par email</p>
              <a href="mailto:azifanmiguel647@gmail.com" className="text-sm text-muted-foreground hover:text-[var(--brand)] underline">
                azifanmiguel647@gmail.com
              </a>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 flex items-start gap-4">
            <div className="size-10 rounded-full bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
              <Phone className="size-5 text-[var(--brand)]" />
            </div>
            <div>
              <p className="font-medium mb-1">Par téléphone</p>
              <a href="tel:+2290153664891" className="text-sm text-muted-foreground hover:text-[var(--brand)] underline">
                +229 01 53 66 48 91
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}