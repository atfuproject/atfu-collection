import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { DesignCard } from "@/components/DesignCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquireButton } from "@/components/EnquiryModal";
import { getDesign, getRelated } from "@/lib/data";

type Props = { params: { slug: string } };
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await getDesign(params.slug);
  if (!d) return {};
  const title = d.seo_title || `${d.name} | ${d.collection.title}`;
  const description = d.seo_description || d.description.slice(0, 155) || `${d.name}, a custom ${d.collection.title} design by ATFU COLLECTION in Kisumu, Kenya.`;
  return { title, description, alternates: { canonical: `/designs/${d.slug}` }, openGraph: { title, description, images: d.images[0] ? [d.images[0].src] : undefined } };
}

export default async function DesignPage({ params }: Props) {
  const d = await getDesign(params.slug);
  if (!d) notFound();
  const related = await getRelated(d.collection.id, d.id);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Collections", href: "/collections" }, { label: d.collection.title, href: `/collections/${d.collection.slug}` }, { label: d.name }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Gallery images={d.images} name={d.name} />
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Link href={`/collections/${d.collection.slug}`} className="text-sm text-gold hover:underline">{d.collection.title}</Link>
          <h1 className="mt-2 font-display text-5xl font-light md:text-6xl">{d.name}</h1>
          <p className="mt-3 text-sm text-fg/60">Reference {d.reference}</p>
          {d.description && <p className="mt-8 max-w-prose whitespace-pre-line leading-relaxed text-fg/80">{d.description}</p>}
          <div className="mt-10 max-w-sm">
            <EnquireButton design={{ slug: d.slug, name: d.name, reference: d.reference, category: d.collection.title }} />
            <p className="mt-3 text-sm text-fg/60">Every piece is made to order. Message us for a quotation.</p>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="rel">
          <h2 id="rel" className="font-display text-4xl font-light">More from {d.collection.title}</h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{related.map((r) => <li key={r.slug}><DesignCard d={r} /></li>)}</ul>
        </section>
      )}
    </div>
  );
}
