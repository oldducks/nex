import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mind | Personal Portfolio",
  description: "Experience my world - Digital portfolio, catalog, and contact hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen relative`}>
        <div className="ambient-light" />
        {children}
      </body>
    </html>
  );
}
