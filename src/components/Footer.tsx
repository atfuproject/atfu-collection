import Link from "next/link";
import { Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { collections, navLinks, site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

export function Footer() {
  const social = "grid h-11 w-11 place-items-center border border-fg/25 transition duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold";
  return (
    <footer className="border-t border-line/15 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 md:px-10">
        <div className="md:col-span-1">
          <Logo className="h-52" />
          <p className="mt-5 font-display text-lg italic text-gold">{site.tagline}</p>
          <div className="mt-6 flex gap-3">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="ATFU COLLECTION on Instagram" className={social}><Instagram size={18} /></a>
            <a href={site.facebook} target="_blank" rel="noopener noreferrer" aria-label="ATFU COLLECTION on Facebook" className={social}><Facebook size={18} /></a>
          </div>
        </div>
        <nav aria-label="Footer">
          <h3 className="mb-4 font-display text-xl">Explore</h3>
          <ul className="space-y-2 text-sm text-fg/75">{navLinks.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-gold">{l.label}</Link></li>)}<li><Link href="/privacy" className="hover:text-gold">Privacy Policy</Link></li></ul>
        </nav>
        <nav aria-label="Collections">
          <h3 className="mb-4 font-display text-xl">Collections</h3>
          <ul className="space-y-2 text-sm text-fg/75">{collections.map((c) => <li key={c.slug}><Link href={`/collections/${c.slug}`} className="hover:text-gold">{c.title}</Link></li>)}</ul>
        </nav>
        <div className="space-y-3 text-sm text-fg/75">
          <h3 className="mb-4 font-display text-xl text-fg">Visit or message us</h3>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold"><Phone size={16} /> {site.phoneDisplay} (WhatsApp)</a>
          <a href={site.maps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold"><MapPin size={16} /> {site.location}</a>
        </div>
      </div>
      <p className="border-t border-line/15 px-5 py-6 text-center text-xs text-fg/60">© {new Date().getFullYear()} {site.name}. Tailored to make a statement.</p>
    </footer>
  );
}
