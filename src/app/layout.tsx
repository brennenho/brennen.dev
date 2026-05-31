import "@/styles/globals.css";

import { PostHogProvider } from "@/components/analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://brennen.dev"),
  title: "Brennen Ho",
  description:
    "I create intuitive products that simplify, accelerate, and personalize — with an emphasis on applied AI.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Brennen Ho",
    description:
      "I create intuitive products that simplify, accelerate, and personalize — with an emphasis on applied AI.",
    url: "https://brennen.dev",
    siteName: "Brennen Ho",
    images: [
      {
        url: "/favicon.ico",
        width: 2400,
        height: 2400,
        alt: "Brennen Ho",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Brennen Ho",
    description:
      "I create intuitive products that simplify, accelerate, and personalize — with an emphasis on applied AI.",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>{children}</PostHogProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
