import "~/styles/globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { PostHogProvider } from "~/components/analytics/providers";
import { Footer, Menu, ThemeProvider } from "~/components/site";
import { Toaster } from "~/components/ui";

export const metadata: Metadata = {
  title: "Brennen Ho",
  description: "Impact-driven engineer excited about responsible AI.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const openSans = Open_Sans({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const links = [{ url: "/", label: "about" }];

  return (
    <html lang="en" className={openSans.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Menu links={links} />
            <div className="flex-1">{children}</div>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </PostHogProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
