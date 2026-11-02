import type { Metadata } from "next";
import { headers } from "next/headers"; // <-- Ajout de l'import
import { geistSans, smoochSans } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loca",
  description: "Plateforme de gestion locative",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Récupération du nonce
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${smoochSans.variable} h-full antialiased`}
      nonce={nonce} // <-- On le passe ici
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}