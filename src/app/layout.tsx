import "@/styles/globals.css";

import { PostHogProvider } from "@/components/analytics";
import { Toaster } from "@/components/ui/sonner";
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
  metadataBase: new URL("https://brennen.dev"),
  title: "Brennen Ho",
  description:
    "I create intuitive products that simplify, accelerate, and personalize — with an emphasis on applied AI.",
  icons: [{ rel: "icon", url: favicon }],
  openGraph: {
    title: "Brennen Ho",
    description:
      "I create intuitive products that simplify, accelerate, and personalize — with an emphasis on applied AI.",
    url: "https://brennen.dev",
    siteName: "Brennen Ho",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brennen Ho",
    description:
      "I create intuitive products that simplify, accelerate, and personalize — with an emphasis on applied AI.",
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
          <Toaster richColors visibleToasts={1} />
        </ThemeProvider>
      </body>
    </html>
  );
}
