import "@/styles/globals.css";

import { PostHogProvider } from "@/components/analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Brennen Ho",
  description:
    "I create intuitive products that simplify, accelerate, and personalize — with an emphasis on applied AI.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
