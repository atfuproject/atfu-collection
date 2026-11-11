"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canContent, useProfile } from "@/components/admin/AdminShell";
import { btn, btn2, field } from "@/components/admin/ui";
import { compress } from "@/lib/image";
import { mediaUrl, slugify } from "@/lib/media";

type Col = { id: string; slug: string; title: string; description: string; cover_path: string | null; sort_order: number; visible: boolean };
type Pic = { id: string; path: string; sort_order: number };

function Row({ c, first, last, move }: { c: Col; first: boolean; last: boolean; move: (d: -1 | 1) => void }) {
  const sb = getBrowser()!;
  const [f, setF] = useState({ title: c.title, description: c.description, visible: c.visible });
  const [cover, setCover] = useState<string | null>(c.cover_path);
  const [pics, setPics] = useState<Pic[]>([]);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);

  const loadPics = useCallback(() => { sb.from("collection_images").select("id,path,sort_order").eq("collection_id", c.id).order("sort_order").then(({ data }) => setPics((data ?? []) as Pic[])); }, [sb, c.id]);
  useEffect(loadPics, [loadPics]);

  async function save() {
    setBusy(true); const { error } = await sb.from("collections").update(f).eq("id", c.id); setBusy(false);
    setMsg(error ? error.message : "Saved.");
  }
  async function add(files: FileList | null) {
    if (!files?.length) return; setBusy(true); setMsg("");
    let order = pics.reduce((m, p) => Math.max(m, p.sort_order), -1) + 1; let haveCover = !!cover;
    for (let k = 0; k < files.length; k++) {
      const file = files[k]; setMsg(`Uploading ${k + 1} of ${files.length}…`);
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 25 * 1024 * 1024) { setMsg(`${file.name}: use a JPG, PNG or WebP under 25 MB.`); continue; }
      try {
        const blob = await compress(file, 2400, 0.9);
        const path = `collections/${c.slug}-${Date.now()}-${k}.webp`;
        const up = await sb.storage.from("media").upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
        if (up.error) throw up.error;
        const ins = await sb.from("collection_images").insert({ collection_id: c.id, path, alt: `${c.title} by ATFU COLLECTION`, sort_order: order++ });
        if (ins.error) throw ins.error;
        if (!haveCover) { await sb.from("collections").update({ cover_path: path }).eq("id", c.id); setCover(path); haveCover = true; }
      } catch (e: any) { setMsg(e.message ?? "Upload failed."); }
    }
    setBusy(false); setMsg((m) => (m.startsWith("Uploading") ? "Photos added." : m)); loadPics();
  }
  async function useOnHomepage(p: Pic) {
    const { error } = await sb.from("collections").update({ cover_path: p.path }).eq("id", c.id);
    if (error) { setMsg(error.message); return; }
    setCover(p.path); setMsg("This photo now shows on the homepage within a minute.");
  }
  async function remove(p: Pic) {
    if (!confirm("Delete this photo?")) return;
    await sb.storage.from("media").remove([p.path]); await sb.from("collection_images").delete().eq("id", p.id);
    if (p.path === cover) { const next = pics.find((x) => x.id !== p.id); await sb.from("collections").update({ cover_path: next?.path ?? null }).eq("id", c.id); setCover(next?.path ?? null); }
    loadPics();
  }

  return (
    <li className="grid gap-5 border border-line/15 p-4 sm:grid-cols-[10rem_1fr]">
      <div>
        <div className="relative aspect-[3/4] bg-surface">{cover ? <Image src={mediaUrl(cover)!} alt={`${c.title} homepage photo`} fill sizes="160px" className="object-cover" /> : <p className="p-2 text-xs text-fg/55">No photo yet</p>}</div>
        <p className="mt-2 text-center text-xs text-fg/60">Shown on the homepage</p>
      </div>
      <div className="space-y-3">
        <div><label className="mb-1 block text-sm" htmlFor={`t-${c.id}`}>Title</label><input id={`t-${c.id}`} className={field} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div><label className="mb-1 block text-sm" htmlFor={`d-${c.id}`}>Description</label><textarea id={`d-${c.id}`} rows={3} className={field} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#C5A77D]" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} /> Visible on the website</label>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={save} disabled={busy} className={btn}>Save</button>
          <button onClick={() => move(-1)} disabled={first} className={btn2} aria-label="Move earlier">←</button>
          <button onClick={() => move(1)} disabled={last} className={btn2} aria-label="Move later">→</button>
          {msg && <span role="status" className="text-sm text-gold">{msg}</span>}
        </div>
      </div>
      <details className="sm:col-span-2" open={pics.length > 1}>
        <summary className="cursor-pointer text-sm">Photos in {c.title} ({pics.length})</summary>
        <label className={`mt-4 inline-block cursor-pointer ${btn}`}>{busy ? "Working…" : "Add photos"}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        </label>
        <p className="mt-2 text-xs text-fg/55">Add as many as you like, then pick the one that shows on the homepage.</p>
        {pics.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pics.map((p) => {
              const on = p.path === cover;
              return (
                <li key={p.id} className="border border-line/15 p-2">
                  <div className="relative aspect-[3/4] bg-surface"><Image src={mediaUrl(p.path)!} alt="" fill sizes="160px" className="object-cover" />{on && <span className="absolute left-1 top-1 bg-gold px-2 py-0.5 text-xs text-bg">On homepage</span>}</div>
                  <div className="mt-2 flex flex-col gap-1 text-xs">
                    {!on && <button onClick={() => useOnHomepage(p)} className={`${btn2} px-2 py-2`}>Use on homepage</button>}
                    <button onClick={() => remove(p)} className={`${btn2} px-2 py-2`}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </details>
    </li>
  );
}

export default function CollectionsAdmin() {
  const me = useProfile(); const sb = getBrowser()!;
  const [rows, setRows] = useState<Col[] | null>(null); const [title, setTitle] = useState(""); const [err, setErr] = useState("");
  const reload = useCallback(() => { sb.from("collections").select("id,slug,title,description,cover_path,sort_order,visible").order("sort_order").then(({ data }) => setRows((data ?? []) as Col[])); }, [sb]);
  useEffect(reload, [reload]);
  if (!canContent(me.role)) return <p>You don’t have access to this page.</p>;
  const move = async (i: number, d: -1 | 1) => {
    const a = rows![i], b = rows![i + d]; if (!b) return;
    await sb.from("collections").update({ sort_order: b.sort_order }).eq("id", a.id); await sb.from("collections").update({ sort_order: a.sort_order }).eq("id", b.id); reload();
  };
  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    const { error } = await sb.from("collections").insert({ title: title.trim(), slug: slugify(title), sort_order: (rows ?? []).reduce((m, r) => Math.max(m, r.sort_order), 0) + 1 });
    if (error) setErr(error.code === "23505" ? "A collection with that name already exists." : error.message); else { setTitle(""); reload(); }
  };
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl">Collections</h1>
      <p className="mt-2 text-sm text-fg/60">Add several photos to each collection, then choose the one that appears under “Discover your style” on the homepage. Tall (portrait) photos work best.</p>
      {rows === null ? <p className="mt-8 text-fg/60">Loading…</p> : (
        <ul className="mt-8 space-y-5">{rows.map((c, i) => <Row key={c.id} c={c} first={i === 0} last={i === rows.length - 1} move={(d) => move(i, d)} />)}</ul>
      )}
      <form onSubmit={add} className="mt-10 flex flex-wrap items-end gap-3">
        <div className="flex-1"><label htmlFor="nc" className="mb-1 block text-sm">Add a new collection</label><input id="nc" required placeholder="Collection name" className={field} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <button className={btn}>Add</button>
      </form>
      {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
    </div>
  );
}
