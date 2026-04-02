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
    icon: "/nex_logo_nobg.png",
    shortcut: "/nex_logo_nobg.png",
    apple: "/nex_logo_nobg.png",
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
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      return Promise.all(registrations.map(function(registration) {
        return registration.unregister();
      }));
    }).catch(function() {});

    if ('caches' in window) {
      caches.keys().then(function(keys) {
        return Promise.all(
          keys
            .filter(function(key) { return key.indexOf('nex-offline') === 0; })
            .map(function(key) { return caches.delete(key); })
        );
      }).catch(function() {});
    }
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
