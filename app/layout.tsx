import type { Metadata } from "next";
import { geistSans, smoochSans } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loca",
  description: "Plateforme de gestion locative",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${smoochSans.variable} h-full antialiased`}
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