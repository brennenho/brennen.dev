import "~/styles/globals.css";

import { type Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Menu, ThemeProvider } from "~/components/";

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
