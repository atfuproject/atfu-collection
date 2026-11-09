import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/Img";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getCollections, mediaUrl } from "@/lib/data";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse ATFU COLLECTION’s tunics, men’s suits, wedding attire, lady suits and dresses, tailored in Kisumu, Kenya.",
  alternates: { canonical: "/collections" },
};
export const revalidate = 60;

export default async function Collections() {
  const list = await getCollections();
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Collections" }]} />
      <h1 className="mt-6 font-display text-5xl font-light md:text-7xl">Collections</h1>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c, i) => (
          <li key={c.slug} className={i % 5 === 1 ? "lg:translate-y-12" : ""}>
            <Link href={`/collections/${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden">
              <Img src={mediaUrl(c.cover_path)} alt={`${c.title} by ATFU COLLECTION`} label={`${c.title} photograph placeholder`} sizes="(min-width:1024px) 33vw, 50vw" className="transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <h2 className="absolute bottom-0 p-6 font-display text-4xl text-[#F5F1E9]">{c.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
