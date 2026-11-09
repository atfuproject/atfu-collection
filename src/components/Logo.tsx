// TEMPORARY wordmark. To finalize: set FINAL_LOGO_SVG to the owner's SVG (inline markup or imported component).
// The circle emblem is intentionally NOT drawn yet, to avoid inventing a logo.
import type { ReactNode } from "react";

const FINAL_LOGO_SVG: ReactNode | null = null;

export function Logo({ className = "" }: { className?: string }) {
  if (FINAL_LOGO_SVG) return <span className={className} aria-label="ATFU COLLECTION">{FINAL_LOGO_SVG}</span>;
  return (
    <span className={`inline-flex flex-col leading-none text-gold ${className}`} aria-label="ATFU COLLECTION, A Tailor from Ukwala">
      <span className="font-display text-xl tracking-[0.28em]">ATFU COLLECTION</span>
      <span className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.35em] opacity-80">A Tailor from Ukwala</span>
    </span>
  );
}
