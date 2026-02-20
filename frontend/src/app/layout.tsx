import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NAMECARD.AI | Digital Business Card Platform",
  description:
    "สร้าง แชร์ และติดตามตัวตนทางธุรกิจของคุณ ด้วยแพลตฟอร์มนามบัตรดิจิทัลพลัง AI",
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
