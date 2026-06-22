import type { Metadata } from "next";
import { Montserrat, Oxanium } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { WHATSAPP } from "@/lib/whatsapp";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], display: "swap" });
const oxanium = Oxanium({ variable: "--font-oxanium", weight: ["600", "700", "800"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Tienda Otaku de Anime y Manga en Perú`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["anime", "manga", "figuras", "Blu-ray", "anime goods", "bookarts", "otaku", "Perú", "tienda anime", "coleccionables"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_PE",
    url: SITE_URL,
    title: `${SITE_NAME} — Tienda Otaku de Anime y Manga`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} — Tienda Otaku`, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/oni-icon.png`,
  image: `${SITE_URL}/brand/oni-icon.png`,
  description: SITE_DESCRIPTION,
  areaServed: "PE",
  sameAs: ["https://instagram.com", "https://tiktok.com"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: `+${WHATSAPP}`,
    areaServed: "PE",
    availableLanguage: "Spanish",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${oxanium.variable} h-full antialiased`}>
      <body className="min-h-full bg-oni-black text-oni-bone">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
