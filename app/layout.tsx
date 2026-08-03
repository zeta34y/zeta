import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SitePresence from "@/components/SitePresence";
import "./globals.css";

const siteUrl = "https://www.zeta-play.com";
const siteTitle = "ZETA | متجر ألعاب PC رقمية بأسعار منافسة";
const siteDescription =
  "متجر ZETA لألعاب PC الرقمية، حسابات مشتركة وخاصة، وبكجات ألعاب بأسعار منافسة مع تجربة شراء سهلة واستلام سريع.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: siteTitle,
    template: "%s | ZETA",
  },

  description: siteDescription,
  applicationName: "ZETA",
  creator: "ZETA",
  publisher: "ZETA",
  category: "ألعاب رقمية",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: siteUrl,
    siteName: "ZETA",
    title: siteTitle,
    description: siteDescription,
  },

  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#160b25",
  colorScheme: "dark",
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ZETA",
  alternateName: ["ZETA Games", "zeta-play.com"],
  url: `${siteUrl}/`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ backgroundColor: "#160b25" }}
    >
      <body
        className="min-h-full flex flex-col text-white"
        style={{
          backgroundColor: "#08070d",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, #2a1745 0%, #140c20 45%, #08070d 100%)",
          backgroundAttachment: "fixed",
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        <SitePresence />
        {children}
      </body>
    </html>
  );
}