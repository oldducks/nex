"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  asLink?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, asLink = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { logo: 32, text: "text-sm" },
    md: { logo: 40, text: "text-xl" },
    lg: { logo: 64, text: "text-3xl" },
  };

  const { logo: logoSize, text: textSize } = sizes[size];

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative overflow-hidden rounded-xl" style={{ width: logoSize, height: logoSize }}>
        <Image src="/nex_logo_nobg.png" alt="NEX Solution" fill className="object-contain" unoptimized />
      </div>
      {showText && (
        <div>
          <div className={`font-black uppercase tracking-[0.18em] ${textSize}`} style={{ color: "#050579" }}>
            NEX Solution
          </div>
          {size !== "sm" && (
            <div className="text-xs text-[#64748B]">Digital business platform</div>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return <Link href="/">{content}</Link>;
  }

  return content;
}

// Simple inline logo for navbars
export function LogoInline({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8 overflow-hidden rounded-lg">
        <Image src="/nex_logo_nobg.png" alt="NEX" fill className="object-contain" unoptimized />
      </div>
    </Link>
  );
}

// Footer logo
export function LogoFooter() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-6 w-6 overflow-hidden rounded-md">
        <Image src="/nex_logo_nobg.png" alt="NEX" fill className="object-contain" unoptimized />
      </div>
      <span className="font-black text-xs uppercase tracking-[0.18em]" style={{ color: "#050579" }}>
        NEX Solution
      </span>
    </div>
  );
}
