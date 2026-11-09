export const mediaUrl = (path?: string | null) =>
  !path ? null : path.startsWith("http") || path.startsWith("/") ? path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
export const slugify = (s: string) => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
