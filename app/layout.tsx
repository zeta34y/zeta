import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SitePresence from "@/components/SitePresence";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZETA",
  description: "متجر الألعاب الرقمية",
};

export const viewport: Viewport = {
  themeColor: "#160b25",
  colorScheme: "dark",
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
        <SitePresence />
        {children}
      </body>
    </html>
  );
}