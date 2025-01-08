import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NavBar } from "~/components/navbar";
import { ThemeProvider } from "~/components/theme-provider";

export const metadata: Metadata = {
  title: "Brennen Ho",
  description:
    "Motivated engineer interested in responsible artificial intelligence.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const navLinks = [{ url: "/", label: "about" }];

  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavBar links={navLinks} />
          <div>{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
