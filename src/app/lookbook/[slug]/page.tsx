import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquireButton } from "@/components/EnquiryModal";
import { Img } from "@/components/Img";
import { getStory } from "@/lib/data";

type Props = { params: { slug: string } };
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getStory(params.slug);
  if (!s) return {};
  const title = s.seo_title || `${s.title} | Lookbook`;
  const description = s.seo_description || s.description.slice(0, 155) || `${s.title}, a story from the ATFU COLLECTION Lookbook.`;
  return { title, description, alternates: { canonical: `/lookbook/${s.slug}` }, openGraph: { title, description, images: s.cover ? [s.cover] : undefined } };
}

// Cycling editorial layout: wide, tall, offset-tall.
const slot = [
  "md:col-span-12 aspect-[4/3] md:aspect-[16/9]",
  "md:col-span-7 aspect-[4/5]",
  "md:col-span-5 aspect-[4/5] md:mt-24",
];

export default async function StoryPage({ params }: Props) {
  const s = await getStory(params.slug);
  if (!s) notFound();
  const date = s.published_at ? new Date(s.published_at).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }) : "";
  return (
    <article>
      <header className="relative flex min-h-[75svh] items-end overflow-hidden">
        <Img src={s.cover} alt={`${s.title} by ATFU COLLECTION`} priority label="Story cover placeholder" className="object-[50%_25%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/10" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-40 md:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Lookbook", href: "/lookbook" }, { label: s.title }]} />
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-gold">{s.category}{date ? ` · ${date}` : ""}</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-light md:text-8xl">{s.title}</h1>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10">
        {s.description && <p className="mx-auto max-w-2xl whitespace-pre-line text-center font-display text-2xl leading-relaxed md:text-3xl">{s.description}</p>}
        {s.images.length > 0 && (
          <div className="mt-16 grid gap-4 md:grid-cols-12 md:gap-6">
            {s.images.map((im, i) => (
              <div key={im.src} className={`relative overflow-hidden bg-surface aspect-[4/5] ${slot[i % 3]}`}>
                <Image src={im.src} alt={im.alt} fill sizes={i % 3 === 0 ? "100vw" : "(min-width:768px) 55vw, 100vw"} className="object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="mx-auto mt-20 max-w-md text-center">
          {s.collection && <Link href={`/collections/${s.collection.slug}`} className="inline-block border-b border-gold pb-1 text-gold">Explore {s.collection.title}</Link>}
          <div className="mx-auto mt-8 max-w-xs"><EnquireButton label="Start a conversation" /></div>
        </div>
      </div>
    </article>
  );
}
