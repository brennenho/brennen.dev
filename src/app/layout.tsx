import "@/styles/globals.css";

import { PostHogProvider } from "@/components/analytics";
import { Toaster } from "@/components/ui/sonner";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";
import { ThemeProvider } from "next-themes";

const FAVICONS = {
  production: "/favicon.ico",
  preview: "/favicon-preview.ico",
  development: "/favicon-dev.ico",
} as const;

const deploymentEnv =
  process.env.VERCEL_ENV ??
  (process.env.NODE_ENV === "development" ? "development" : "production");

const favicon =
  FAVICONS[deploymentEnv as keyof typeof FAVICONS] ?? FAVICONS.production;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  icons: [{ rel: "icon", url: favicon }],
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PostHogProvider>{children}</PostHogProvider>
          <SpeedInsights />
          <Toaster richColors visibleToasts={1} />
        </ThemeProvider>
      </body>
    </html>
  );
}
