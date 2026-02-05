"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { dictionary, Language } from '@/lib/i18n';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = dictionary[lang];

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans transition-colors duration-500">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto z-50 relative">
        <div className="font-bold text-2xl tracking-tighter">NAMECARD<span className="text-primary">.AI</span></div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            <Globe size={16} />
            {lang === 'en' ? 'TH' : 'EN'}
          </button>
          <Link href="/login" className="bg-foreground/10 hover:bg-foreground/20 text-foreground transition-colors px-6 py-2 rounded-full font-medium text-sm border border-foreground/5">
            {t.nav.login}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center pt-20 pb-32 px-4 text-foreground">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-30 pointer-events-none"></div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 max-w-5xl mx-auto leading-none uppercase">
          {t.hero.title_prefix} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{t.hero.title_highlight}</span>
        </h1>
        <p className="text-xl text-foreground/60 max-w-2xl mx-auto mb-12 leading-relaxed">
          {t.hero.description}
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            {t.hero.get_started} <ArrowRight size={20} />
          </Link>
          <Link href="/admin_01" className="bg-foreground/5 hover:bg-foreground/10 text-foreground px-8 py-4 rounded-full font-bold text-lg transition-all border border-foreground/10">
            {t.hero.view_demo}
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-foreground">
        <FeatureCard
          icon={<Zap className="text-yellow-400" />}
          title={t.features.instant.title}
          desc={t.features.instant.desc}
        />
        <FeatureCard
          icon={<Shield className="text-green-400" />}
          title={t.features.security.title}
          desc={t.features.security.desc}
        />
        <FeatureCard
          icon={<Globe className="text-blue-400" />}
          title={t.features.global.title}
          desc={t.features.global.desc}
        />
      </div>

      {/* Footer */}
      <footer className="text-center text-foreground/40 py-12 border-t border-foreground/5 mx-6">
        © {new Date().getFullYear()} {t.footer}
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border border-glass-border bg-glass hover:shadow-2xl hover:shadow-primary/5 transition-all">
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-foreground/60 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
