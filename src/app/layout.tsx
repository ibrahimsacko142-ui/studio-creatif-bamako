import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Studio Créatif Bamako — Génération de contenu IA pour créateurs maliens",
  description:
    "Plateforme IA pour créateurs locaux à Bamako et au Mali : bio artiste, posts réseaux sociaux, scripts vidéo, visuels générés, clips vidéo et calendrier de contenu. Pensé pour le contexte ouest-africain francophone.",
  keywords: [
    "Studio Créatif Bamako",
    "génération contenu IA Mali",
    "bio artiste Mali",
    "posts réseaux sociaux Bamako",
    "scripts vidéo TikTok Mali",
    "visuels IA créateurs maliens",
    "SK Designer Luxe",
    "Créateur Boutique",
  ],
  authors: [{ name: "Ibrahim Sacko — SK Designer Luxe" }],
  openGraph: {
    title: "Studio Créatif Bamako",
    description: "Générez votre contenu créatif en quelques secondes, adapté au contexte malien.",
    siteName: "Studio Créatif Bamako",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased bg-stone-50 text-stone-900 min-h-screen`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
