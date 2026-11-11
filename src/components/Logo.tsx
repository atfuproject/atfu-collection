// Official ATFU COLLECTION logo. The artwork is public/images/logo-mark.png, used as a mask so it
// takes the theme's gold automatically (champagne in dark mode, deeper gold in light mode).
// Size it with a height class, e.g. <Logo className="h-20" />. To replace the artwork, swap the PNG
// (keep it transparent) and update the two numbers below to its pixel size.
const W = 1296, H = 1132;
const mask = "url(/images/logo-mark.png)";

export function Logo({ className = "h-16" }: { className?: string }) {
  return (
    <span role="img" aria-label="ATFU COLLECTION, A Tailor from Ukwala" className={`inline-block shrink-0 ${className}`} style={{ aspectRatio: `${W} / ${H}` }}>
      <span className="block h-full w-full bg-gold" style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }} />
    </span>
  );
}
