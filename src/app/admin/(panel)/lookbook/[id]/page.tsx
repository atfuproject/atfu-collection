"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canContent, useProfile } from "@/components/admin/AdminShell";
import { btn, btn2, field } from "@/components/admin/ui";
import { compress } from "@/lib/image";
import { mediaUrl, slugify } from "@/lib/media";

const CATEGORIES = ["Wedding Edit", "The Executive Edit", "Contemporary African Fashion", "Special Occasions", "Signature ATFU Designs"];
const blank = { title: "", slug: "", edit_category: CATEGORIES[4], description: "", collection_id: "", status: "draft", featured: false, published_at: "", seo_title: "", seo_description: "" };

export default function StoryEditor() {
  const me = useProfile(); const router = useRouter(); const sb = getBrowser()!;
  const id = useParams<{ id: string }>().id; const isNew = id === "new";
  const [f, setF] = useState(blank);
  const [cover, setCover] = useState<string | null>(null);
  const [cols, setCols] = useState<{ id: string; title: string }[]>([]);
  const [imgs, setImgs] = useState<any[]>([]);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [slugTouched, setSlugTouched] = useState(false);

  const loadImgs = useCallback(async () => { const { data } = await sb.from("lookbook_images").select("*").eq("story_id", id).order("sort_order"); setImgs(data ?? []); }, [sb, id]);
  useEffect(() => {
    sb.from("collections").select("id,title").order("sort_order").then(({ data }) => setCols(data ?? []));
    if (!isNew) {
      sb.from("lookbook_stories").select("*").eq("id", id).maybeSingle().then(({ data }) => {
        if (!data) return;
        setF({ ...blank, ...data, collection_id: data.collection_id ?? "", published_at: data.published_at ? data.published_at.slice(0, 10) : "", seo_title: data.seo_title ?? "", seo_description: data.seo_description ?? "" });
        setCover(data.cover_path); setSlugTouched(true);
      });
      loadImgs();
    }
  }, [sb, id, isNew, loadImgs]);
  if (!canContent(me.role)) return <p>You don’t have access to this page.</p>;
  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v, ...(k === "title" && !slugTouched ? { slug: slugify(v) } : {}) }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const published_at = f.published_at ? new Date(f.published_at).toISOString() : f.status === "published" ? new Date().toISOString() : null;
    const row = { title: f.title.trim(), slug: slugify(f.slug), edit_category: f.edit_category, description: f.description, collection_id: f.collection_id || null, status: f.status, featured: f.featured, published_at, seo_title: f.seo_title || null, seo_description: f.seo_description || null };
    const res = isNew ? await sb.from("lookbook_stories").insert(row).select("id").single() : await sb.from("lookbook_stories").update(row).eq("id", id).select("id").single();
    setBusy(false);
    if (res.error) { setMsg(res.error.code === "23505" ? "That web address name is already used by another story." : res.error.message); return; }
    if (isNew) router.replace(`/admin/lookbook/${res.data!.id}`); else { setMsg("Saved."); if (!f.published_at && published_at) setF((p) => ({ ...p, published_at: published_at.slice(0, 10) })); }
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return; setMsg("");
    let order = imgs.reduce((m, i) => Math.max(m, i.sort_order), -1) + 1; let haveCover = !!cover;
    for (let k = 0; k < files.length; k++) {
      const file = files[k]; setMsg(`Uploading ${k + 1} of ${files.length}…`);
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 25 * 1024 * 1024) { setMsg(`${file.name}: use a JPG, PNG or WebP under 25 MB.`); continue; }
      try {
        const blob = await compress(file, 2400, 0.9); const path = `lookbook/${id}/${crypto.randomUUID()}.webp`;
        const up = await sb.storage.from("media").upload(path, blob, { contentType: blob.type, cacheControl: "31536000" }); if (up.error) throw up.error;
        const ins = await sb.from("lookbook_images").insert({ story_id: id, path, alt: `${f.title} by ATFU COLLECTION`, sort_order: order++ }); if (ins.error) throw ins.error;
        if (!haveCover) { await sb.from("lookbook_stories").update({ cover_path: path }).eq("id", id); setCover(path); haveCover = true; }
      } catch (e: any) { setMsg(e.message ?? "Upload failed."); }
    }
    setMsg((m) => (m.startsWith("Uploading") ? "Photos added." : m)); loadImgs();
  }
  const useCover = async (im: any) => { await sb.from("lookbook_stories").update({ cover_path: im.path }).eq("id", id); setCover(im.path); setMsg("Cover updated."); };
  const move = async (k: number, d: -1 | 1) => { const a = imgs[k], b = imgs[k + d]; if (!b) return; await sb.from("lookbook_images").update({ sort_order: b.sort_order }).eq("id", a.id); await sb.from("lookbook_images").update({ sort_order: a.sort_order }).eq("id", b.id); loadImgs(); };
  const remove = async (im: any) => {
    if (!confirm("Delete this photograph?")) return;
    await sb.storage.from("media").remove([im.path]); await sb.from("lookbook_images").delete().eq("id", im.id);
    if (im.path === cover) { const next = imgs.find((x) => x.id !== im.id); await sb.from("lookbook_stories").update({ cover_path: next?.path ?? null }).eq("id", id); setCover(next?.path ?? null); }
    loadImgs();
  };
  const removeStory = async () => {
    if (!confirm("Delete this story and all its photographs permanently? To keep it hidden instead, set the status to Archived.")) return;
    if (imgs.length) await sb.storage.from("media").remove(imgs.map((i) => i.path));
    const { error } = await sb.from("lookbook_stories").delete().eq("id", id);
    if (error) setMsg(error.message); else router.replace("/admin/lookbook");
  };

  return (
    <div className="max-w-3xl">
      <Link href="/admin/lookbook" className="text-sm text-gold">← All stories</Link>
      <h1 className="mt-3 font-display text-4xl">{isNew ? "New story" : f.title || "Edit story"}</h1>
      <form onSubmit={save} className="mt-8 space-y-5">
        <div><label htmlFor="t" className="mb-1 block text-sm">Story title</label><input id="t" required className={field} value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="c" className="mb-1 block text-sm">Edit (category)</label><select id="c" className={field} value={f.edit_category} onChange={(e) => set("edit_category", e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label htmlFor="col" className="mb-1 block text-sm">Related collection</label><select id="col" className={field} value={f.collection_id} onChange={(e) => set("collection_id", e.target.value)}><option value="">None</option>{cols.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
        </div>
        <div><label htmlFor="s" className="mb-1 block text-sm">Web address name</label><input id="s" required pattern="[a-z0-9\-]+" className={field} value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} /><p className="mt-1 text-xs text-fg/55">Appears as /lookbook/{f.slug || "…"}</p></div>
        <div><label htmlFor="d" className="mb-1 block text-sm">Description</label><textarea id="d" rows={5} className={field} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="st" className="mb-1 block text-sm">Status</label><select id="st" className={field} value={f.status} onChange={(e) => set("status", e.target.value)}><option value="draft">Draft (hidden)</option><option value="published">Published</option><option value="archived">Archived (hidden)</option></select></div>
          <div><label htmlFor="pd" className="mb-1 block text-sm">Publication date</label><input id="pd" type="date" className={field} value={f.published_at} onChange={(e) => set("published_at", e.target.value)} /></div>
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#C5A77D]" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Feature on the homepage and at the top of the Lookbook</label>
        <details className="border border-line/15 p-4"><summary className="cursor-pointer text-sm">Search engine text (optional)</summary>
          <div className="mt-4 space-y-4"><input aria-label="SEO title" placeholder="Page title" className={field} value={f.seo_title} onChange={(e) => set("seo_title", e.target.value)} /><textarea aria-label="SEO description" rows={2} placeholder="Short description for search results" className={field} value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></div></details>
        {msg && <p role="status" className="text-sm text-gold">{msg}</p>}
        <div className="flex flex-wrap gap-3"><button disabled={busy} className={btn}>{busy ? "Saving…" : isNew ? "Create story" : "Save changes"}</button>{!isNew && <button type="button" onClick={removeStory} className={btn2}>Delete story</button>}</div>
      </form>

      {!isNew && (
        <section className="mt-14" aria-labelledby="ph">
          <h2 id="ph" className="font-display text-3xl">Photographs</h2>
          <p className="mt-1 text-sm text-fg/60">Photos appear in this order in the story. Choose one as the cover.</p>
          <label className={`mt-5 inline-block cursor-pointer ${btn}`}>Add photographs<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} /></label>
          {imgs.length === 0 ? <p className="mt-6 text-fg/60">No photographs yet.</p> : (
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {imgs.map((im, k) => (
                <li key={im.id} className="border border-line/15 p-2">
                  <div className="relative aspect-[3/4] bg-surface"><Image src={mediaUrl(im.path)!} alt={im.alt} fill sizes="200px" className="object-cover" />{im.path === cover && <span className="absolute left-1 top-1 bg-gold px-2 py-0.5 text-xs text-bg">Cover</span>}</div>
                  <input aria-label="Photo description" defaultValue={im.alt} onBlur={(e) => e.target.value !== im.alt && sb.from("lookbook_images").update({ alt: e.target.value }).eq("id", im.id).then(loadImgs)} className={`${field} mt-2 py-2 text-sm`} />
                  <div className="mt-2 flex flex-wrap gap-1 text-xs">
                    <button onClick={() => move(k, -1)} disabled={k === 0} className={`${btn2} px-3 py-2`} aria-label="Move earlier">←</button>
                    <button onClick={() => move(k, 1)} disabled={k === imgs.length - 1} className={`${btn2} px-3 py-2`} aria-label="Move later">→</button>
                    {im.path !== cover && <button onClick={() => useCover(im)} className={`${btn2} px-3 py-2`}>Make cover</button>}
                    <button onClick={() => remove(im)} className={`${btn2} px-3 py-2`}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
