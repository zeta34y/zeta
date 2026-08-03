import type { Metadata } from "next";

const pageUrl = "https://www.zeta-play.com/shared-games";
const pageTitle = "ألعاب PC مشتركة بأسعار اقتصادية";
const pageDescription =
  "تصفح ألعاب PC المشتركة في متجر ZETA بأسعار اقتصادية، مع تفاصيل واضحة لكل لعبة وتجربة شراء سهلة واستلام سريع.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,

  alternates: {
    canonical: "/shared-games",
  },

  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: pageUrl,
    siteName: "ZETA",
    title: `${pageTitle} | ZETA`,
    description: pageDescription,
  },

  twitter: {
    card: "summary",
    title: `${pageTitle} | ZETA`,
    description: pageDescription,
  },

  robots: {
    index: true,
    follow: true,
  },
};

const collectionStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `${pageTitle} | ZETA`,
  description: pageDescription,
  url: pageUrl,
  isPartOf: {
    "@type": "WebSite",
    name: "ZETA",
    url: "https://www.zeta-play.com/",
  },
};

export default function SharedGamesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionStructuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {children}
    </>
  );
}