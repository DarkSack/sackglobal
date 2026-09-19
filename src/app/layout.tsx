import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Footer } from "@/components/Footer";
import { SearchCommand } from "@/components/SearchCommand";
import { SiteNavbar } from "@/components/SiteNavbar";
import { THEME_SCRIPT } from "@/components/ThemeToggle";
import { profile } from "@/content/profile";
import { social } from "@/content/social";
import { getArchive } from "@/lib/projects";
import { getSearchIndex } from "@/lib/search";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const description = `${profile.fullName} (${profile.alias}). ${profile.statement}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${profile.alias} — Engineer, Builder, Experimenter`, template: `%s — ${profile.alias}` },
  description,
  applicationName: SITE_NAME,
  authors: [{ name: profile.fullName, url: SITE_URL }],
  alternates: { canonical: "/", types: { "application/rss+xml": "/journal/rss.xml" } },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_MX",
    url: "/",
    title: `${profile.alias} — Engineer, Builder, Experimenter`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    creator: social.find((s) => s.id === "x")?.handle,
  },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080a0d" },
    { media: "(prefers-color-scheme: light)", color: "#f3f2ee" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ archive }, searchIndex] = await Promise.all([getArchive(), getSearchIndex()]);

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${archivo.variable} ${geist.variable} ${geistMono.variable} ${instrument.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Saltar al contenido
        </a>
        <SiteNavbar />
        <main id="main">{children}</main>
        <Footer dataFetchedAt={archive.fetchedAt} dataSource={archive.source} />
        <SearchCommand index={searchIndex} />
      </body>
    </html>
  );
}
