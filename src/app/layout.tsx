import "@/styles/globals.css";

import { type Metadata } from "next";
import { Exo_2 } from "next/font/google";

export const metadata: Metadata = {
  title: "Brennen Ho",
  description:
    "I create intuitive products that simplify, accelerate, and personalize — with an emphasis on applied AI.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const exo_2 = Exo_2({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={exo_2.className}>
      <body>{children}</body>
    </html>
  );
}
