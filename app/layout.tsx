import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientErrorListener from "@/components/layout/client-error-listener";
import { ToastProvider } from "@/components/ui/toast";
import { validateRuntimeEnv } from "@/lib/env/validate-env";
import ThemeProvider from "@/components/layout/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kothay Jabo? — Discover Events in Dhaka",
  description: "Kothay Jabo? — Find concerts, workshops, exhibitions, theatre and more happening across Dhaka, Bangladesh.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kothayjabo.com"),
  alternates: {
    canonical: "/home",
  },
  openGraph: {
    title: "Kothay Jabo?",
    description:
      "Find concerts, workshops, exhibitions, theatre and more happening across Dhaka, Bangladesh.",
    url: "/home",
    siteName: "Kothay Jabo?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const envCheck = validateRuntimeEnv();
  void envCheck;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            <ClientErrorListener />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
