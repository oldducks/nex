import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mind | Personal Portfolio",
  description: "Experience my world - Digital portfolio, catalog, and contact hub.",
};

const themeScript = `
(function() {
  try {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} antialiased min-h-screen relative bg-background text-foreground transition-colors duration-500`}>
        <ThemeProvider>
          <div className="ambient-light" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
