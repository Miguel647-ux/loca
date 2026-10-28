import Link from "next/link";
import { CookieBanner } from "@/components/landing/cookie-banner";
import { 
  ArrowRight, 
  Building2, 
  CreditCard, 
  DoorOpen, 
  FileText, 
  Receipt, 
  Users, 
  Wallet 
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/landing/animated-section";
import { LandingHeader } from "@/components/landing/header";
import { AnimatedBackground } from "@/components/landing/animated-background";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen font-sans relative">
      <AnimatedBackground />
      <LandingHeader />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
              Gérez vos biens locatifs <br className="hidden md:block" />
              <span className="text-[var(--brand)]">sans prise de tête.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              LOCA centralise vos propriétés, vos locataires, vos baux et vos paiements. 
              Offrez un espace premium à vos locataires et reprenez le contrôle.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-[var(--brand)]/20")}>
                Créer mon compte
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link href="#features" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto h-12 px-8 text-base bg-background/50 backdrop-blur-sm")}>
                Découvrir les fonctionnalités
              </Link>
            </div>
          </AnimatedSection>

          {/* Mockup abstrait du Dashboard en CSS */}
          <AnimatedSection delay={200} className="mt-16 md:mt-24 relative max-w-5xl mx-auto">
            <div className="rounded-t-2xl border-x border-t bg-card/50 backdrop-blur-md shadow-2xl overflow-hidden p-2 md:p-4">
              <div className="rounded-xl border bg-background/80 overflow-hidden flex h-[300px] md:h-[500px]">
                <div className="w-48 border-r bg-muted/20 hidden md:flex flex-col p-4 gap-4">
                  <div className="h-6 w-24 bg-muted rounded mb-4" />
                  <div className="h-8 bg-[var(--brand)]/10 rounded flex items-center px-2">
                    <div className="h-4 w-4 bg-[var(--brand)] rounded-full mr-2" />
                    <div className="h-3 w-16 bg-[var(--brand)]/30 rounded" />
                  </div>
                  <div className="h-8 rounded flex items-center px-2">
                    <div className="h-4 w-4 bg-muted-foreground/30 rounded-full mr-2" />
                    <div className="h-3 w-16 bg-muted rounded" />
                  </div>
                  <div className="h-8 rounded flex items-center px-2">
                    <div className="h-4 w-4 bg-muted-foreground/30 rounded-full mr-2" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col gap-6">
                  <div className="h-8 w-1/3 bg-muted rounded" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-muted/30 rounded-xl p-4 flex flex-col justify-between">
                      <div className="h-3 w-12 bg-muted rounded" />
                      <div className="h-6 w-20 bg-muted rounded" />
                    </div>
                    <div className="h-24 bg-[var(--brand)]/5 rounded-xl p-4 flex flex-col justify-between border border-[var(--brand)]/20">
                      <div className="h-3 w-12 bg-[var(--brand)]/30 rounded" />
                      <div className="h-6 w-20 bg-[var(--brand)]/50 rounded" />
                    </div>
                    <div className="h-24 bg-muted/30 rounded-xl p-4 flex flex-col justify-between">
                      <div className="h-3 w-12 bg-muted rounded" />
                      <div className="h-6 w-20 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex-1 bg-muted/10 rounded-xl border border-dashed flex items-center justify-center text-muted-foreground text-sm">
                    Aperçu de votre tableau de bord
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 md:py-32 bg-background/80 backdrop-blur-sm border-y border-border/50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Tout ce qu'il faut pour réussir
            </h2>
            <p className="text-muted-foreground text-lg">
              Une suite d'outils pensée pour les propriétaires modernes et leurs locataires.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: "Propriétés", desc: "Ajoutez vos biens, leurs photos et suivez leur état en temps réel." },
              { icon: DoorOpen, title: "Logements", desc: "Gérez les appartements et maisons associés à chaque propriété." },
              { icon: Users, title: "Locataires", desc: "Centralisez les coordonnées de vos locataires en quelques clics." },
              { icon: FileText, title: "Baux", desc: "Créez et suivez la durée de vie de vos baux sans effort." },
              { icon: CreditCard, title: "Paiements", desc: "Enregistrez les loyers perçus et suivez les impayés instantanément." },
              { icon: Receipt, title: "Reçus", desc: "Générez des reçus professionnels à envoyer à vos locataires." },
            ].map((f, i) => (
              <AnimatedSection key={i} delay={i * 100} className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border/50 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="size-12 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="size-6 text-[var(--brand)]" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-32 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Simple comme bonjour
            </h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-border -translate-y-1/2 z-0" />
            
            {[
              { step: "1", icon: Building2, title: "Créez", desc: "Ajoutez vos propriétés et vos logements en quelques minutes." },
              { step: "2", icon: Users, title: "Gérez", desc: "Invitez vos locataires, créez vos baux et suivez tout au même endroit." },
              { step: "3", icon: Wallet, title: "Encaissez", desc: "Suivez les paiements, relancez les impayés et générez des reçus." }
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 150} className="relative z-10 flex flex-col items-center text-center">
                <div className="size-16 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-6 shadow-sm">
                  <s.icon className="size-6 text-[var(--brand)]" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">{s.step}. {s.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{s.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 md:py-32 bg-background/80 backdrop-blur-sm">
        <AnimatedSection className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-3xl bg-[var(--brand)] p-8 md:p-16 text-center text-[var(--brand-foreground)] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Prêt à simplifier votre gestion ?
              </h2>
              <p className="text-[var(--brand-foreground)]/80 text-lg mb-8 max-w-xl mx-auto">
                Rejoignez les propriétaires qui ont déjà choisi LOCA pour gérer leur parc immobilier sereinement.
              </p>
              <Link href="/auth/register" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-12 px-8 text-base")}>
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* FOOTER */}
            <footer className="border-t py-8 md:py-12 bg-background relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-xl">Loca</span>
            <span className="text-muted-foreground text-sm">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/legal/notices" className="hover:text-foreground">Mentions légales</Link>
            <Link href="/legal/privacy" className="hover:text-foreground">Confidentialité</Link>
            <Link href="/legal/terms" className="hover:text-foreground">CGU</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
      <CookieBanner />
    </div>
  );
}