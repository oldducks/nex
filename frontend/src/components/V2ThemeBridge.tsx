"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function V2ThemeBridge() {
  const pathname = usePathname();
  const isV2 = pathname === "/v2" || pathname.startsWith("/v2/");

  useEffect(() => {
    const html = document.documentElement;
    if (isV2) {
      html.setAttribute("data-shell", "control2");
    } else {
      html.removeAttribute("data-shell");
    }

    return () => {
      html.removeAttribute("data-shell");
    };
  }, [isV2]);

  return null;
}
