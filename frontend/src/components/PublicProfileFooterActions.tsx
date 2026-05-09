"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Facebook, Globe, MessageSquare, Share2, Twitter, X } from "lucide-react";
import { LineIcon, SOCIAL_COLORS, SOCIAL_ICONS } from "./SocialIcons";

type ContactLink = {
  name: string;
  href: string;
  platform?: string;
};

const MODAL_OVERLAY_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.52)",
  zIndex: 9999,
  backdropFilter: "blur(8px)",
};

const MODAL_SHEET_STYLE: React.CSSProperties = {
  position: "fixed",
  left: "50%",
  bottom: 0,
  transform: "translateX(-50%)",
  width: "min(100%, 520px)",
  backgroundColor: "white",
  borderTopLeftRadius: "28px",
  borderTopRightRadius: "28px",
  boxShadow: "0 -12px 40px rgba(15,23,42,0.16)",
  padding: "1rem 1rem calc(1rem + env(safe-area-inset-bottom))",
  maxHeight: "78vh",
  overflow: "hidden",
};

const MODAL_CONTENT_STYLE: React.CSSProperties = {
  maxHeight: "calc(78vh - 2rem)",
  overflowY: "auto",
  padding: "1.5rem 1rem 0.25rem",
};

function useLockBodyScroll(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);
}

export function PublicShareModal({
  isOpen,
  onClose,
  url,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const shareLinks = [
    {
      name: "LINE",
      icon: (
        <div style={{ width: "48px", height: "48px", backgroundColor: "#06C755", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
          <LineIcon size={28} />
        </div>
      ),
      href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Facebook",
      icon: (
        <div style={{ width: "48px", height: "48px", backgroundColor: "#1877F2", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
          <Facebook size={28} fill="currentColor" />
        </div>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "X",
      icon: (
        <div style={{ width: "48px", height: "48px", backgroundColor: "#000000", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
          <Twitter size={24} fill="currentColor" />
        </div>
      ),
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Copy share url failed:", error);
    }
  };

  return (
    <div style={MODAL_OVERLAY_STYLE} onClick={onClose}>
      <div
        style={MODAL_SHEET_STYLE}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ width: "56px", height: "5px", borderRadius: "9999px", backgroundColor: "#D9E1F2", margin: "0 auto 0.75rem" }} />
        <div style={MODAL_CONTENT_STYLE}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "2rem", color: "#050579", textAlign: "center" }}>
            แชร์หน้านี้
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "1.75rem" }}>
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}
              >
                {link.icon}
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#64748B", letterSpacing: "0.05em" }}>{link.name}</span>
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              width: "100%",
              height: "3.5rem",
              borderRadius: "9999px",
              border: "1px solid #D9E1F2",
              backgroundColor: copied ? "#EEF0FF" : "#F8FAFF",
              color: "#050579",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              fontSize: "14px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            <Copy size={18} />
            {copied ? "คัดลอกลิงก์แล้ว" : "คัดลอกลิงก์หน้านี้"}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              marginTop: "1rem",
              width: "100%",
              height: "3.25rem",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#F97316",
              color: "white",
              fontSize: "14px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactModal({
  isOpen,
  onClose,
  title,
  description,
  links,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  links: ContactLink[];
}) {
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div style={MODAL_OVERLAY_STYLE} onClick={onClose}>
      <div
        style={MODAL_SHEET_STYLE}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ width: "56px", height: "5px", borderRadius: "9999px", backgroundColor: "#D9E1F2", margin: "0 auto 0.75rem" }} />
        <div style={MODAL_CONTENT_STYLE}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.75rem", color: "#050579", textAlign: "center" }}>
            {title}
          </h3>
          {description ? (
            <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#64748B", textAlign: "center", marginBottom: "1.75rem" }}>
              {description}
            </p>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {links.map((link) => {
              const platformKey = (link.platform || "").toLowerCase();
              const IconComponent = SOCIAL_ICONS[platformKey] || Globe;
              const color = SOCIAL_COLORS[platformKey] || "#6366F1";
              return (
                <a
                  key={`${link.name}-${link.href}`}
                  href={link.href}
                  target={link.href.startsWith("tel:") || link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={link.href.startsWith("tel:") || link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: `${color}18`,
                      color,
                    }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#64748B", letterSpacing: "0.05em", textAlign: "center" }}>{link.name}</span>
                </a>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              marginTop: "1.5rem",
              width: "100%",
              height: "3.25rem",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#F97316",
              color: "white",
              fontSize: "14px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export function PublicProfileFooterActions({
  shareUrl,
  shareTitle,
  contactLinks,
  contactTitle = "ช่องทางการติดต่อ",
  contactDescription,
}: {
  shareUrl: string;
  shareTitle: string;
  contactLinks: ContactLink[];
  contactTitle?: string;
  contactDescription?: string;
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const normalizedLinks = useMemo(
    () => contactLinks.filter((link) => typeof link?.href === "string" && link.href.trim().length > 0),
    [contactLinks],
  );

  return (
    <>
      <div className="mt-2 flex flex-col items-center gap-4">
        {normalizedLinks.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[rgba(5,5,121,0.08)] bg-white/90 px-6 text-sm font-black uppercase tracking-[0.05em] text-[#050579] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] transition hover:bg-white"
          >
            <MessageSquare size={20} />
            <span>{contactTitle}</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[rgba(0,0,0,0.05)] bg-white/90 px-6 text-sm font-black uppercase tracking-[0.05em] text-[#050579] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] transition hover:bg-white"
        >
          <Share2 size={20} />
          <span>แชร์หน้านี้</span>
        </button>
      </div>

      <PublicShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} url={shareUrl} title={shareTitle} />
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={contactTitle}
        description={contactDescription}
        links={normalizedLinks}
      />
    </>
  );
}
