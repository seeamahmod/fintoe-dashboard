import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "FinToe Banking", template: "%s · FinToe Banking" },
  description: "A personal banking dashboard: balances, spending, cards, loans and support in one place.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#f3f2f0" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Render per request so every page receives the CSP nonce set in proxy.ts.
  await connection();
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
