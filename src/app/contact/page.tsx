import type { Metadata } from "next";
import { Facebook, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquireButton } from "@/components/EnquiryModal";
import { site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact ATFU COLLECTION, a bespoke tailor in Migosi, Kisumu, Kenya, on WhatsApp or by phone.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  const row = "flex items-center gap-4 py-5 transition hover:text-gold";
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="mt-6 font-display text-5xl font-light md:text-7xl">Contact</h1>
      <p className="mt-4 max-w-md text-fg/75">The quickest way to reach us is WhatsApp. Tell us what you have in mind and we’ll take it from there.</p>
      <div className="mt-8 max-w-xs"><EnquireButton label="Send an enquiry" /></div>
      <ul className="mt-12 divide-y divide-line/15 border-y border-line/15">
        <li><a href={waLink()} target="_blank" rel="noopener noreferrer" className={row}><MessageCircle size={20} /> WhatsApp {site.phoneDisplay}</a></li>
        <li><a href={`tel:+${site.whatsapp}`} className={row}><Phone size={20} /> Call {site.phoneDisplay}</a></li>
        <li><a href={site.maps} target="_blank" rel="noopener noreferrer" className={row}><MapPin size={20} /> {site.location}, get directions</a></li>
        <li><a href={site.instagram} target="_blank" rel="noopener noreferrer" className={row}><Instagram size={20} /> Instagram</a></li>
        <li><a href={site.facebook} target="_blank" rel="noopener noreferrer" className={row}><Facebook size={20} /> Facebook</a></li>
      </ul>
    </div>
  );
}
