// Public read layer. Works without Supabase configured (falls back to the static collection list, designs show an empty state).
import { createClient } from "@supabase/supabase-js";
import { collections as staticCollections, defaultBiography } from "./site";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const db = url && anon
  ? createClient(url, anon, { auth: { persistSession: false }, global: { fetch: (u, i) => fetch(u, { ...i, next: { revalidate: 60 } }) } })
  : null;

export const mediaUrl = (path?: string | null) =>
  !path ? null : path.startsWith("http") || path.startsWith("/") ? path : `${url}/storage/v1/object/public/media/${path}`;

export type ImgRow = { path: string; alt: string; is_cover: boolean; sort_order: number };
export type CollectionRow = { id: string; slug: string; title: string; description: string; cover_path: string | null };
export type CardData = { slug: string; reference: string; name: string; cover: string | null; alt: string; collection?: string };
export type DesignFull = {
  id: string; slug: string; reference: string; name: string; description: string;
  seo_title: string | null; seo_description: string | null;
  collection: { id: string; slug: string; title: string };
  images: { src: string; alt: string }[];
};

const fallback: CollectionRow[] = staticCollections.map((c) => ({ id: c.slug, slug: c.slug, title: c.title, description: "", cover_path: c.cover }));
const sorted = (imgs: ImgRow[] = []) => [...imgs].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);

export async function getCollections(): Promise<CollectionRow[]> {
  if (!db) return fallback;
  const { data, error } = await db.from("collections").select("id,slug,title,description,cover_path").eq("visible", true).order("sort_order");
  return error || !data?.length ? fallback : (data as CollectionRow[]);
}
export async function getCollection(slug: string) {
  return (await getCollections()).find((c) => c.slug === slug) ?? null;
}

const toCard = (d: any): CardData => {
  const first = sorted(d.design_images)[0];
  return { slug: d.slug, reference: d.reference, name: d.name, cover: mediaUrl(first?.path), alt: first?.alt || `${d.name} by ATFU COLLECTION`, collection: d.collections?.title };
};

export const PAGE_SIZE = 12;
export async function listDesigns(collectionId: string, q: string, page: number) {
  if (!db) return { items: [] as CardData[], total: 0 };
  const from = (page - 1) * PAGE_SIZE;
  let query = db.from("designs").select("slug,reference,name,design_images(path,alt,is_cover,sort_order)", { count: "exact" })
    .eq("collection_id", collectionId).eq("status", "published").order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  const clean = q.replace(/[,()%*\\]/g, " ").trim().slice(0, 60);
  if (clean) query = query.or(`name.ilike.%${clean}%,reference.ilike.%${clean}%`);
  const { data, count } = await query;
  return { items: (data ?? []).map(toCard), total: count ?? 0 };
}

export async function getDesign(slug: string): Promise<DesignFull | null> {
  if (!db) return null;
  const { data } = await db.from("designs").select("id,slug,reference,name,description,seo_title,seo_description,collections(id,slug,title),design_images(path,alt,is_cover,sort_order)")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  if (!data) return null;
  const d: any = data;
  return {
    id: d.id, slug: d.slug, reference: d.reference, name: d.name, description: d.description,
    seo_title: d.seo_title, seo_description: d.seo_description, collection: d.collections,
    images: sorted(d.design_images).map((i) => ({ src: mediaUrl(i.path)!, alt: i.alt || `${d.name} by ATFU COLLECTION` })),
  };
}

export async function getRelated(collectionId: string, excludeId: string): Promise<CardData[]> {
  if (!db) return [];
  const { data } = await db.from("designs").select("slug,reference,name,collections(title),design_images(path,alt,is_cover,sort_order)")
    .eq("collection_id", collectionId).eq("status", "published").neq("id", excludeId).limit(4);
  return (data ?? []).map(toCard);
}

export async function getHeroImage(): Promise<string | null> {
  if (!db) return null;
  const { data } = await db.from("site_settings").select("value").eq("key", "hero").maybeSingle();
  return mediaUrl((data?.value as { path?: string } | null)?.path);
}

export async function getBiography(): Promise<string> {
  if (!db) return defaultBiography;
  const { data } = await db.from("site_settings").select("value").eq("key", "biography").maybeSingle();
  return ((data?.value as { text?: string } | null)?.text ?? "").trim() || defaultBiography;
}

export async function getFeaturedDesigns(limit = 6): Promise<CardData[]> {
  if (!db) return [];
  const { data } = await db.from("designs").select("slug,reference,name,collections(title),design_images(path,alt,is_cover,sort_order)")
    .eq("status", "published").eq("featured", true).order("featured_order", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false }).limit(limit);
  return (data ?? []).map(toCard);
}

export type TestimonialData = { id: string; author_name: string; author_detail: string | null; quote: string; photo: string | null };
export async function getTestimonials(limit = 3): Promise<TestimonialData[]> {
  if (!db) return [];
  const { data } = await db.from("testimonials").select("id,author_name,author_detail,quote,photo_path").eq("published", true)
    .order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(limit);
  return (data ?? []).map((t: any) => ({ id: t.id, author_name: t.author_name, author_detail: t.author_detail, quote: t.quote, photo: mediaUrl(t.photo_path) }));
}

export async function getCollectionImages(collectionId: string): Promise<{ src: string; alt: string }[]> {
  if (!db) return [];
  const { data } = await db.from("collection_images").select("path,alt").eq("collection_id", collectionId).order("sort_order");
  return (data ?? []).map((d: any) => ({ src: mediaUrl(d.path)!, alt: d.alt || "ATFU COLLECTION" }));
}

export type StoryCard = { slug: string; title: string; category: string; description: string; cover: string | null; published_at: string | null; featured: boolean };
const toStory = (s: any): StoryCard => ({ slug: s.slug, title: s.title, category: s.edit_category, description: s.description, cover: mediaUrl(s.cover_path), published_at: s.published_at, featured: s.featured });

// Featured stories first, then newest.
export async function getStories(limit = 24): Promise<StoryCard[]> {
  if (!db) return [];
  const { data } = await db.from("lookbook_stories").select("slug,title,edit_category,description,cover_path,published_at,featured").eq("status", "published")
    .order("featured", { ascending: false }).order("published_at", { ascending: false, nullsFirst: false }).limit(limit);
  return (data ?? []).map(toStory);
}

export async function getStory(slug: string) {
  if (!db) return null;
  const { data } = await db.from("lookbook_stories").select("slug,title,edit_category,description,cover_path,published_at,featured,seo_title,seo_description,collections(slug,title),lookbook_images(path,alt,sort_order)")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  if (!data) return null;
  const s: any = data;
  return {
    ...toStory(s), seo_title: s.seo_title as string | null, seo_description: s.seo_description as string | null,
    collection: (s.collections ?? null) as { slug: string; title: string } | null,
    images: [...(s.lookbook_images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => ({ src: mediaUrl(i.path)!, alt: i.alt || `${s.title} by ATFU COLLECTION` })),
  };
}

export async function getSitemapData() {
  if (!db) return { collections: [] as { slug: string }[], designs: [] as { slug: string; updated_at: string }[], stories: [] as { slug: string; published_at: string | null }[] };
  const [c, d, s] = await Promise.all([
    db.from("collections").select("slug").eq("visible", true),
    db.from("designs").select("slug,updated_at").eq("status", "published"),
    db.from("lookbook_stories").select("slug,published_at").eq("status", "published"),
  ]);
  return { collections: c.data ?? [], designs: (d.data ?? []) as any[], stories: (s.data ?? []) as any[] };
}
