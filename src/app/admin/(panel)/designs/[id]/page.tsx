"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canContent, useProfile } from "@/components/admin/AdminShell";
import { btn, btn2, field } from "@/components/admin/ui";
import { mediaUrl, slugify } from "@/lib/media";

const blank = { name: "", slug: "", reference: "", collection_id: "", description: "", status: "draft", featured: false, seo_title: "", seo_description: "" };
const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("compress"))), "image/webp", 0.82));
}

export default function DesignEditor() {
  const me = useProfile(); const router = useRouter();
  const id = useParams<{ id: string }>().id; const isNew = id === "new";
  const sb = getBrowser()!;
  const [f, setF] = useState({ ...blank, reference: `ATFU-${Date.now().toString(36).slice(-5).toUpperCase()}` });
  const [cols, setCols] = useState<{ id: string; title: string }[]>([]);
  const [imgs, setImgs] = useState<any[]>([]);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [prog, setProg] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const loadImgs = useCallback(async () => {
    const { data } = await sb.from("design_images").select("*").eq("design_id", id).order("sort_order");
    setImgs(data ?? []);
  }, [sb, id]);
  useEffect(() => {
    sb.from("collections").select("id,title").order("sort_order").then(({ data }) => { setCols(data ?? []); if (isNew && data?.[0]) setF((p) => ({ ...p, collection_id: data[0].id })); });
    if (!isNew) {
      sb.from("designs").select("*").eq("id", id).maybeSingle().then(({ data }) => { if (data) { setF({ ...blank, ...data, seo_title: data.seo_title ?? "", seo_description: data.seo_description ?? "" }); setSlugTouched(true); } });
      loadImgs();
    }
  }, [sb, id, isNew, loadImgs]);
  if (!canContent(me.role)) return <p>You don’t have access to designs.</p>;

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v, ...(k === "name" && !slugTouched ? { slug: slugify(v) } : {}) }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const row = { name: f.name.trim(), slug: slugify(f.slug), reference: f.reference.trim(), collection_id: f.collection_id, description: f.description, status: f.status, featured: f.featured, seo_title: f.seo_title || null, seo_description: f.seo_description || null, updated_at: new Date().toISOString() };
    const res = isNew ? await sb.from("designs").insert(row).select("id").single() : await sb.from("designs").update(row).eq("id", id).select("id").single();
    setBusy(false);
    if (res.error) { setMsg(res.error.code === "23505" ? "That reference or URL name is already used by another design." : res.error.message); return; }
    if (isNew) router.replace(`/admin/designs/${res.data!.id}`); else setMsg("Saved.");
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return; setMsg("");
    let order = imgs.reduce((m, i) => Math.max(m, i.sort_order), -1) + 1; let hasCover = imgs.some((i) => i.is_cover);
    for (let k = 0; k < files.length; k++) {
      const file = files[k]; setProg(`Uploading ${k + 1} of ${files.length}…`);
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 20 * 1024 * 1024) { setMsg(`${file.name}: use a JPG, PNG or WebP under 20 MB.`); continue; }
      try {
        const blob = await compress(file);
        const path = `designs/${id}/${crypto.randomUUID()}.${EXT[blob.type] ?? "jpg"}`;
        const up = await sb.storage.from("media").upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
        if (up.error) throw up.error;
        const ins = await sb.from("design_images").insert({ design_id: id, path, alt: `${f.name} by ATFU COLLECTION`, is_cover: !hasCover, sort_order: order++ });
        if (ins.error) throw ins.error; hasCover = true;
      } catch (err: any) { setMsg(`${file.name}: ${err.message ?? "upload failed"}`); }
    }
    setProg(""); loadImgs();
  }
  const setCover = async (im: any) => { await sb.from("design_images").update({ is_cover: false }).eq("design_id", id); await sb.from("design_images").update({ is_cover: true }).eq("id", im.id); loadImgs(); };
  const move = async (k: number, d: -1 | 1) => {
    const a = imgs[k], b = imgs[k + d]; if (!b) return;
    await sb.from("design_images").update({ sort_order: b.sort_order }).eq("id", a.id); await sb.from("design_images").update({ sort_order: a.sort_order }).eq("id", b.id); loadImgs();
  };
  const remove = async (im: any) => {
    if (!confirm("Delete this photograph?")) return;
    await sb.storage.from("media").remove([im.path]); await sb.from("design_images").delete().eq("id", im.id);
    if (im.is_cover) { const next = imgs.find((x) => x.id !== im.id); if (next) await sb.from("design_images").update({ is_cover: true }).eq("id", next.id); }
    loadImgs();
  };
  const removeDesign = async () => {
    if (!confirm("Delete this design and all its photographs permanently? To keep it hidden instead, set the status to Archived.")) return;
    if (imgs.length) await sb.storage.from("media").remove(imgs.map((i) => i.path));
    const { error } = await sb.from("designs").delete().eq("id", id);
    if (error) setMsg(error.message); else router.replace("/admin/designs");
  };

  return (
    <div className="max-w-3xl">
      <Link href="/admin/designs" className="text-sm text-gold">← All designs</Link>
      <h1 className="mt-3 font-display text-4xl">{isNew ? "New design" : f.name || "Edit design"}</h1>
      <form onSubmit={save} className="mt-8 space-y-5">
        <div><label htmlFor="n" className="mb-1 block text-sm">Design name</label><input id="n" required className={field} value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="r" className="mb-1 block text-sm">Reference (unique)</label><input id="r" required className={field} value={f.reference} onChange={(e) => set("reference", e.target.value)} /></div>
          <div><label htmlFor="c" className="mb-1 block text-sm">Collection</label><select id="c" required className={field} value={f.collection_id} onChange={(e) => set("collection_id", e.target.value)}>{cols.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
        </div>
        <div><label htmlFor="s" className="mb-1 block text-sm">Web address name</label><input id="s" required pattern="[a-z0-9\-]+" className={field} value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} /><p className="mt-1 text-xs text-fg/55">Appears as /designs/{f.slug || "…"}. Lowercase letters, numbers and dashes.</p></div>
        <div><label htmlFor="d" className="mb-1 block text-sm">Description</label><textarea id="d" rows={5} className={field} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="st" className="mb-1 block text-sm">Status</label><select id="st" className={field} value={f.status} onChange={(e) => set("status", e.target.value)}><option value="draft">Draft (hidden)</option><option value="published">Published</option><option value="archived">Archived (hidden)</option></select></div>
          <label className="flex items-center gap-3 pt-7 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#C5A77D]" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Show in Signature Designs on the homepage</label>
        </div>
        <details className="border border-line/15 p-4"><summary className="cursor-pointer text-sm">Search engine text (optional)</summary>
          <div className="mt-4 space-y-4"><input aria-label="SEO title" placeholder="Page title" className={field} value={f.seo_title} onChange={(e) => set("seo_title", e.target.value)} /><textarea aria-label="SEO description" rows={2} placeholder="Short description for search results" className={field} value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></div></details>
        {msg && <p role="status" className="text-sm text-gold">{msg}</p>}
        <div className="flex flex-wrap gap-3"><button disabled={busy} className={btn}>{busy ? "Saving…" : isNew ? "Create design" : "Save changes"}</button>{!isNew && me.role === "owner" && <button type="button" onClick={removeDesign} className={btn2}>Delete design</button>}</div>
      </form>

      {!isNew && (
        <section className="mt-14" aria-labelledby="ph">
          <h2 id="ph" className="font-display text-3xl">Photographs</h2>
          <p className="mt-1 text-sm text-fg/60">Photos are resized and compressed automatically. The cover appears on cards and in the collection.</p>
          <label className={`mt-5 inline-block cursor-pointer ${btn}`}>Add photographs<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} /></label>
          {prog && <p role="status" className="mt-3 text-sm text-gold">{prog}</p>}
          {imgs.length === 0 ? <p className="mt-6 text-fg/60">No photographs yet.</p> : (
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {imgs.map((im, k) => (
                <li key={im.id} className="border border-line/15 p-2">
                  <div className="relative aspect-[3/4] bg-surface"><Image src={mediaUrl(im.path)!} alt={im.alt} fill sizes="200px" className="object-cover" />{im.is_cover && <span className="absolute left-1 top-1 bg-gold px-2 py-0.5 text-xs text-bg">Cover</span>}</div>
                  <input aria-label="Photo description" defaultValue={im.alt} onBlur={(e) => e.target.value !== im.alt && sb.from("design_images").update({ alt: e.target.value }).eq("id", im.id).then(loadImgs)} className={`${field} mt-2 py-2 text-sm`} />
                  <div className="mt-2 flex flex-wrap gap-1 text-xs">
                    <button onClick={() => move(k, -1)} disabled={k === 0} className={`${btn2} px-3 py-2`} aria-label="Move earlier">←</button>
                    <button onClick={() => move(k, 1)} disabled={k === imgs.length - 1} className={`${btn2} px-3 py-2`} aria-label="Move later">→</button>
                    {!im.is_cover && <button onClick={() => setCover(im)} className={`${btn2} px-3 py-2`}>Make cover</button>}
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
