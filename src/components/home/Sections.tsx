import Link from "next/link";
import { Instagram } from "lucide-react";
import { Img } from "@/components/Img";
import { DesignCard } from "@/components/DesignCard";
import type { CardData, StoryCard, TestimonialData } from "@/lib/data";
import { site } from "@/lib/site";

const wrap = "mx-auto max-w-7xl px-5 md:px-10";

export function SignatureDesigns({ designs }: { designs: CardData[] }) {
  if (!designs.length) return null;
  return (
    <section aria-labelledby="sig" className={`${wrap} py-20 md:py-28`}>
      <div className="flex items-end justify-between gap-4">
        <h2 id="sig" className="font-display text-4xl font-light md:text-6xl">Signature designs</h2>
        <Link href="/collections" className="shrink-0 text-sm text-gold hover:underline">All collections</Link>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3">
        {designs.map((d, i) => <li key={d.slug} className={i % 3 === 1 ? "lg:translate-y-10" : ""}><DesignCard d={d} /></li>)}
      </ul>
    </section>
  );
}

export function Story({ image, bio }: { image: string | null; bio: string }) {
  const paras = bio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).slice(0, 2);
  return (
    <section aria-labelledby="story" className="bg-surface py-20 md:py-28">
      <div className={`${wrap} grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-bg"><Img src={image} alt="The founder of ATFU COLLECTION" sizes="(min-width:768px) 40vw, 100vw" quality={85} label="Owner photograph placeholder" /></div>
        <div>
          <h2 id="story" className="font-display text-4xl font-light leading-tight md:text-6xl">Crafted with purpose. Worn with confidence.</h2>
          <div className="mt-8 max-w-xl space-y-4 font-display text-xl leading-relaxed text-fg/85">{paras.map((p) => <p key={p}>{p}</p>)}</div>
          <Link href="/about" className="mt-8 inline-block border-b border-gold pb-1 text-sm text-gold">Read the full story</Link>
        </div>
      </div>
    </section>
  );
}

const why = [
  ["Personalized tailoring", "Designs made around your preferences and your vision."],
  ["Attention to detail", "Each piece is finished with care."],
  ["Individual style", "Choose a design you love, or bring an idea of your own."],
  ["Quality craftsmanship", "Creativity and craftsmanship brought together in every piece."],
  ["Direct consultation", "Speak to us on WhatsApp, or visit us in Migosi, Kisumu."],
];
export function WhyAtfu() {
  return (
    <section aria-labelledby="why" className={`${wrap} py-20 md:py-28`}>
      <h2 id="why" className="font-display text-4xl font-light md:text-6xl">Why ATFU</h2>
      <dl className="mt-10 divide-y divide-line/15 border-y border-line/15">
        {why.map(([t, d]) => (
          <div key={t} className="grid gap-2 py-6 md:grid-cols-[1fr_1.4fr] md:gap-10">
            <dt className="font-display text-2xl md:text-3xl">{t}</dt>
            <dd className="text-fg/75">{d}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Testimonials({ items }: { items: TestimonialData[] }) {
  if (!items.length) return null; // hidden until real testimonials are published
  return (
    <section aria-labelledby="tst" className="bg-surface py-20 md:py-28">
      <div className={wrap}>
        <h2 id="tst" className="font-display text-4xl font-light md:text-6xl">In their words</h2>
        <ul className="mt-10 grid gap-10 md:grid-cols-3">
          {items.map((t) => (
            <li key={t.id}>
              <blockquote className="font-display text-2xl leading-snug">“{t.quote}”</blockquote>
              <p className="mt-4 text-sm text-fg/70"><span className="text-fg">{t.author_name}</span>{t.author_detail ? `, ${t.author_detail}` : ""}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function InstagramSection() {
  return (
    <section aria-labelledby="ig" className={`${wrap} py-20 text-center md:py-28`}>
      <h2 id="ig" className="font-display text-4xl font-light md:text-6xl">Follow the work</h2>
      <p className="mx-auto mt-4 max-w-md text-fg/70">New designs and behind-the-scenes moments from the atelier in Kisumu.</p>
      <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-3 border border-gold px-8 py-4 text-sm text-gold transition hover:bg-gold hover:text-bg"><Instagram size={18} /> @atfu_collection</a>
    </section>
  );
}

export function LookbookSection({ stories }: { stories: StoryCard[] }) {
  if (!stories.length) return null;
  const [lead, ...rest] = stories;
  const text = "absolute inset-x-0 bottom-0 p-5 text-[#F5F1E9] md:p-8";
  return (
    <section aria-labelledby="lb" className={`${wrap} py-20 md:py-28`}>
      <div className="flex items-end justify-between gap-4">
        <h2 id="lb" className="font-display text-4xl font-light md:text-6xl">The Lookbook</h2>
        <Link href="/lookbook" className="shrink-0 text-sm text-gold hover:underline">View the Lookbook</Link>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-12">
        <Link href={`/lookbook/${lead.slug}`} className="group relative block aspect-[4/5] overflow-hidden md:col-span-7 md:aspect-auto md:min-h-[34rem]">
          <Img src={lead.cover} alt={`${lead.title} by ATFU COLLECTION`} sizes="(min-width:768px) 58vw, 100vw" label="Story cover placeholder" className="transition duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <div className={text}><p className="text-xs uppercase tracking-[0.25em] text-[#C5A77D]">{lead.category}</p><h3 className="mt-2 font-display text-4xl md:text-5xl">{lead.title}</h3></div>
        </Link>
        {rest.length > 0 && (
          <div className="grid gap-6 md:col-span-5">
            {rest.map((s) => (
              <Link key={s.slug} href={`/lookbook/${s.slug}`} className="group relative block aspect-[4/3] overflow-hidden">
                <Img src={s.cover} alt={`${s.title} by ATFU COLLECTION`} sizes="(min-width:768px) 40vw, 100vw" label="Story cover placeholder" className="transition duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className={text}><p className="text-xs uppercase tracking-[0.25em] text-[#C5A77D]">{s.category}</p><h3 className="mt-1 font-display text-3xl">{s.title}</h3></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
