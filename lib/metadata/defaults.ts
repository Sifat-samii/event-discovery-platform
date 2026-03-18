import type { Metadata } from "next";

const siteName = "Kothay Jabo?";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kothayjabo.com";

export function createMetadata(overrides: Metadata): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    ...overrides,
    openGraph: {
      siteName,
      type: "website",
      ...overrides.openGraph,
    },
  };
}

