// Defaults. Phase 3+ reads these from the site_settings table so the owner can edit them.
export const site = {
  name: "ATFU COLLECTION",
  tagline: "A Tailor from Ukwala.",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254723094777",
  phoneDisplay: "+254 723 094 777",
  instagram: "https://www.instagram.com/atfu_collection/",
  facebook: "https://www.facebook.com/Atfucollection",
  maps: "https://maps.app.goo.gl/A2Run2Frc5xwN3bg6",
  location: "Migosi, Kisumu, Kenya",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Owner photograph: set to e.g. "/images/hero.jpg" (file in /public/images) or an uploaded storage URL.
  heroImage: null as string | null,
};
// cover: same idea. null shows a labelled placeholder.
export const collections = [
  { slug: "tunics", title: "Tunics", cover: null as string | null },
  { slug: "mens-suits", title: "Men’s Suits", cover: null as string | null },
  { slug: "weddings", title: "Weddings", cover: null as string | null },
  { slug: "lady-suits", title: "Lady Suits", cover: null as string | null },
  { slug: "dresses", title: "Dresses", cover: null as string | null },
];
export const navLinks = [
  { href: "/collections", label: "Collections" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
