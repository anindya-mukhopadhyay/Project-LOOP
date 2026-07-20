import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const appName = "Project LOOP";
const appDescription = "AI Customer Feedback Intelligence Platform for enterprise product teams.";

export const metadata: Metadata = {
  applicationName: appName,
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  keywords: [
    "customer feedback",
    "AI analytics",
    "feedback intelligence",
    "SaaS",
    "multi-tenant analytics",
  ],
  authors: [{ name: "Project LOOP" }],
  creator: "Project LOOP",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: appName,
    description: appDescription,
    type: "website",
    siteName: appName,
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1214" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
