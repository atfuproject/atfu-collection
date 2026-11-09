import Image from "next/image";
// One component for every photograph. No src => clearly labelled placeholder (never passes as a real ATFU design).
export function Img({ src, alt, className = "", priority = false, sizes = "100vw", label = "Placeholder photograph" }:
  { src?: string | null; alt: string; className?: string; priority?: boolean; sizes?: string; label?: string }) {
  if (!src) {
    return (
      <div role="img" aria-label={`${label} (to be replaced)`} className={`absolute inset-0 flex items-end bg-gradient-to-br from-surface via-bg to-surface ${className}`}>
        <span className="m-4 border border-gold/40 px-2 py-1 text-[0.65rem] tracking-wider text-gold/80">{label}</span>
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
}
