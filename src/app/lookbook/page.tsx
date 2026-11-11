import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Img } from "@/components/Img";
import { getStories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Fashion stories from ATFU COLLECTION in Kisumu, Kenya: wedding elegance, executive style, contemporary African fashion and special occasions.",
  alternates: { canonical: "/lookbook" },
};
export const revalidate = 60;
const when = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-KE", { month: "long", year: "numeric" }) : "");

export default async function Lookbook() {
  const stories = await getStories();
  const [lead, ...rest] = stories;
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Lookbook" }]} />
      <h1 className="mt-6 font-display text-5xl font-light md:text-7xl">The Lookbook</h1>
      {!lead ? (
        <div className="mx-auto max-w-md py-24 text-center">
          <h2 className="font-display text-3xl">Stories are on their way.</h2>
          <p className="mt-3 text-fg/70">In the meantime, explore the collections.</p>
          <Link href="/collections" className="mt-6 inline-block border border-gold px-8 py-4 text-sm text-gold transition hover:bg-gold hover:text-bg">View collections</Link>
        </div>
      ) : (
        <>
          <Link href={`/lookbook/${lead.slug}`} className="group relative mt-12 block aspect-[4/5] overflow-hidden md:aspect-[16/9]">
            <Img src={lead.cover} alt={`${lead.title} by ATFU COLLECTION`} priority sizes="100vw" label="Story cover placeholder" className="transition duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-[#F5F1E9] md:p-12">
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A77D]">{lead.category}{lead.published_at ? ` · ${when(lead.published_at)}` : ""}</p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl font-light md:text-7xl">{lead.title}</h2>
            </div>
          </Link>
          {rest.length > 0 && (
            <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((s, i) => (
                <li key={s.slug} className={i % 3 === 1 ? "lg:translate-y-12" : ""}>
                  <Link href={`/lookbook/${s.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-surface"><Img src={s.cover} alt={`${s.title} by ATFU COLLECTION`} sizes="(min-width:1024px) 33vw, 50vw" label="Story cover placeholder" className="transition duration-700 group-hover:scale-105" /></div>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gold">{s.category}</p>
                    <h3 className="mt-1 font-display text-3xl">{s.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
