// Public read layer. Works without Supabase configured (falls back to the static collection list, designs show an empty state).
import { createClient } from "@supabase/supabase-js";
import { collections as staticCollections } from "./site";

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
