import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/seo/JsonLd";
import { buildGraphSchema } from "@/lib/seo";
import { SITE_URL, FUND } from "@/lib/constants";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${FUND.name} | Event-Driven Public Equities`,
    template: `%s | ${FUND.name}`,
  },
  description: FUND.description,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: FUND.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01":
        process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-background-alt focus:px-4 focus:py-2 focus:text-ink focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <JsonLd data={buildGraphSchema()} />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Only on Vercel: elsewhere the injected script 404s and fails the
            errors-in-console audit in CI. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
