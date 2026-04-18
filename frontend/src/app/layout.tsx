import type { Metadata } from "next";
import { Prompt, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieConsent } from "@/components/CookieConsent";
import V2ThemeBridge from "@/components/V2ThemeBridge";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});
const configuredTheme = process.env.NEXT_PUBLIC_THEME_VARIANT === "cyan-orange-green" ? "brand-cog" : "light";

export const metadata: Metadata = {
  title: "NEX Solution | Digital Business Card Platform",
  description:
    "สร้าง แชร์ และติดตามตัวตนทางธุรกิจของคุณ ด้วยแพลตฟอร์มนามบัตรดิจิทัลพลัง AI ภายใต้แบรนด์ NEX Solution",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
};

const themeScript = `
(function() {
  try {
    const theme = localStorage.getItem('theme') || '${configuredTheme}';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

const serviceWorkerScript = `
(function() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function(reg) {
        console.log('[SW] Registered:', reg.scope);
      })
      .catch(function(err) {
        console.warn('[SW] Registration failed:', err);
      });
  });
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
        <meta name="theme-color" content="#050579" />
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerScript }} />
      </head>
      <body className={`${prompt.variable} ${montserrat.variable} antialiased min-h-screen relative bg-background text-foreground transition-colors duration-500`}>
        <ThemeProvider>
          <V2ThemeBridge />
          <div className="ambient-light" />
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
