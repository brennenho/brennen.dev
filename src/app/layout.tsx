import "~/styles/globals.css";

import { type Metadata } from "next";
import { Rubik } from "next/font/google";
import { Menu } from "~/components/menu";
import { ThemeProvider } from "~/components/theme-provider";

export const metadata: Metadata = {
  title: "Brennen Ho",
  description:
    "Motivated engineer interested in responsible artificial intelligence.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const font = Rubik({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const links = [{ url: "/", label: "about" }];

  return (
    <html lang="en" className={font.className} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Menu links={links} />
          <div>{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
