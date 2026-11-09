"use client";
import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { WhatsAppFab } from "./WhatsAppFab";

// Public header, footer and WhatsApp button appear on the public site only, never inside /admin.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  if (usePathname().startsWith("/admin")) return <>{children}</>;
  return (<><Nav /><main>{children}</main><Footer /><WhatsAppFab /></>);
}
