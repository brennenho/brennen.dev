import "~/styles/globals.css";

import { type Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Menu } from "~/components/menu";
import { ThemeProvider } from "~/components/theme-provider";

export const metadata: Metadata = {
  title: "Brennen Ho",
  description:
    "Motivated engineer interested in responsible artificial intelligence.",
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
