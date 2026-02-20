import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientErrorListener from "@/components/layout/client-error-listener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cultural Events Platform - Dhaka",
  description: "Discover and stay updated with cultural events, concerts, workshops, and exhibitions across Dhaka, Bangladesh",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://eventsdhaka.com"),
  openGraph: {
    title: "Events Dhaka",
    description:
      "Discover and stay updated with cultural events, concerts, workshops, and exhibitions across Dhaka, Bangladesh",
    url: "/home",
    siteName: "Events Dhaka",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClientErrorListener />
        {children}
      </body>
    </html>
  );
}
