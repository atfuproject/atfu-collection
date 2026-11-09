import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { Img } from "@/components/Img";
import { DesignCard } from "@/components/DesignCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquireButton } from "@/components/EnquiryModal";
import { PAGE_SIZE, getCollection, listDesigns, mediaUrl } from "@/lib/data";

type Props = { params: { slug: string }; searchParams: { q?: string; page?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCollection(params.slug);
  if (!c) return {};
  return {
    title: `${c.title} | Bespoke tailoring in Kisumu`,
    description: c.description || `Explore ${c.title} designs by ATFU COLLECTION, a bespoke tailor in Migosi, Kisumu, Kenya.`,
    alternates: { canonical: `/collections/${c.slug}` },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const c = await getCollection(params.slug);
  if (!c) notFound();
  const q = (searchParams.q ?? "").slice(0, 60);
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const { items, total } = await listDesigns(c.id, q, page);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => `/collections/${c.slug}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <>
      <section className="relative flex min-h-[55svh] items-end overflow-hidden">
        <Img src={mediaUrl(c.cover_path)} alt={`${c.title} collection banner`} priority label={`${c.title} banner placeholder`} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/20" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-32 md:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Collections", href: "/collections" }, { label: c.title }]} />
          <h1 className="mt-5 font-display text-6xl font-light md:text-8xl">{c.title}</h1>
          <p className="mt-4 max-w-xl text-fg/75">{c.description || `Designs from our ${c.title} collection, made to your measure in Migosi, Kisumu.`}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 md:px-10">
        <form action={`/collections/${c.slug}`} role="search" className="mb-10 flex max-w-md border border-fg/25 focus-within:border-gold">
          <label htmlFor="q" className="sr-only">Search {c.title}</label>
          <input id="q" name="q" defaultValue={q} placeholder="Search by name or reference" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base outline-none" />
          <button aria-label="Search" className="grid w-12 place-items-center text-gold"><Search size={18} /></button>
        </form>

        {items.length ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {items.map((d) => <li key={d.slug}><DesignCard d={d} /></li>)}
          </ul>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center">
            <h2 className="font-display text-3xl">{q ? "No designs match your search." : "Designs are being added."}</h2>
            <p className="mt-3 text-fg/70">{q ? "Try a different word, or clear the search." : "Message us to see what we’re working on in this collection."}</p>
            <div className="mt-6">{q ? <Link href={`/collections/${c.slug}`} className="text-gold underline">Clear search</Link> : <EnquireButton label="Start a conversation" className="bg-gold px-8 py-4 text-sm font-medium text-bg" />}</div>
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-6 text-sm">
            {page > 1 && <Link href={href(page - 1)} className="border border-fg/30 px-5 py-3 hover:border-gold hover:text-gold">Previous</Link>}
            <span className="text-fg/60">Page {page} of {pages}</span>
            {page < pages && <Link href={href(page + 1)} className="border border-fg/30 px-5 py-3 hover:border-gold hover:text-gold">Next</Link>}
          </nav>
        )}
      </section>
    </>
  );
}
