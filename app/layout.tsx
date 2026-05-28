import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { DataProvider } from "@/components/data-provider";
import { AuthGate } from "@/components/auth-gate";

export const metadata: Metadata = {
  title: "InfluDash",
  description: "Pilote interne de tracking d'influenceurs",
  applicationName: "InfluDash",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "InfluDash",
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark h-full antialiased" suppressHydrationWarning>
      <body className="min-h-[100dvh]">
        <ThemeProvider>
          <DataProvider>
            <AuthGate>
              <AppShell>{children}</AppShell>
            </AuthGate>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
