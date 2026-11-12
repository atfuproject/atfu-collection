import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Img } from "@/components/Img";
import { getBiography, getHeroImage } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About ATFU COLLECTION",
  description: "ATFU COLLECTION is a fashion and tailoring brand in Migosi, Kisumu, Kenya, rooted in the identity of A Tailor from Ukwala.",
  alternates: { canonical: "/about" },
};
export const revalidate = 60;

export default async function About() {
  const [bio, photo] = await Promise.all([getBiography(), getHeroImage()]);
  const [lead, ...rest] = bio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <h1 className="mt-6 font-display text-5xl font-light md:text-7xl">About ATFU</h1>
      <div className="mt-12 grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
        <div className="relative aspect-[4/5] bg-surface md:sticky md:top-28 md:self-start"><Img src={photo} alt="The founder of ATFU COLLECTION" sizes="(min-width:768px) 40vw, 100vw" quality={85} label="Owner photograph placeholder" /></div>
        <div>
          <p className="font-display text-3xl leading-snug md:text-4xl">{lead}</p>
          <div className="mt-8 max-w-xl space-y-5 text-lg leading-relaxed text-fg/80">{rest.map((p) => <p key={p}>{p}</p>)}</div>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="mt-10 inline-block bg-gold px-8 py-4 text-sm font-medium text-bg">Start a Conversation</a>
        </div>
      </div>
    </div>
  );
}
