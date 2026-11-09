import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", description: "How ATFU COLLECTION handles the details you share when you enquire.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  const h = "mt-10 font-display text-2xl";
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-28 md:pt-36">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      <h1 className="mt-6 font-display text-5xl font-light">Privacy Policy</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-fg/80">
        <p>{site.name} is a tailoring business in {site.location}. This page explains what we collect when you use this website.</p>
        <h2 className={h}>What we collect</h2>
        <p>When you send an enquiry, we store your name, your country or location, your message, the design you asked about, and your phone number if you choose to give it. We also record when you press the button to open WhatsApp. This does not mean a message was sent.</p>
        <p>We may count visits to pages and designs to understand what people find useful. These counts are not used to identify you.</p>
        <h2 className={h}>How we use it</h2>
        <p>We use your details only to reply to your enquiry and to manage our work. We do not sell your information.</p>
        <h2 className={h}>WhatsApp</h2>
        <p>Continuing to WhatsApp opens a separate service, WhatsApp, which has its own privacy terms. Your conversation there is between you and us.</p>
        <h2 className={h}>Where it’s kept</h2>
        <p>Enquiries are stored in a secured online database and can be seen only by authorised ATFU staff.</p>
        <h2 className={h}>Your choices</h2>
        <p>To ask us to correct or delete your details, message us on <a className="text-gold underline" href={`https://wa.me/${site.whatsapp}`}>WhatsApp</a>.</p>
      </div>
    </div>
  );
}
