"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canContent, useProfile } from "@/components/admin/AdminShell";
import { btn, btn2, field } from "@/components/admin/ui";
import { compress } from "@/lib/image";
import { mediaUrl, slugify } from "@/lib/media";

type Col = { id: string; slug: string; title: string; description: string; cover_path: string | null; sort_order: number; visible: boolean };

function Row({ c, first, last, move, reload }: { c: Col; first: boolean; last: boolean; move: (d: -1 | 1) => void; reload: () => void }) {
  const sb = getBrowser()!;
  const [f, setF] = useState({ title: c.title, description: c.description, visible: c.visible });
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true); const { error } = await sb.from("collections").update(f).eq("id", c.id); setBusy(false);
    setMsg(error ? error.message : "Saved.");
  }
  async function cover(file?: File) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 25 * 1024 * 1024) { setMsg("Use a JPG, PNG or WebP photo under 25 MB."); return; }
    setBusy(true); setMsg("");
    try {
      const blob = await compress(file, 2400, 0.9);
      const path = `collections/${c.slug}-${Date.now()}.webp`;
      const up = await sb.storage.from("media").upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (up.error) throw up.error;
      const u = await sb.from("collections").update({ cover_path: path }).eq("id", c.id);
      if (u.error) throw u.error;
      if (c.cover_path) await sb.storage.from("media").remove([c.cover_path]);
      setMsg("Photo saved. The site updates within a minute."); reload();
    } catch (e: any) { setMsg(e.message ?? "Upload failed."); }
    setBusy(false);
  }
  return (
    <li className="grid gap-5 border border-line/15 p-4 sm:grid-cols-[10rem_1fr]">
      <div>
        <div className="relative aspect-[3/4] bg-surface">{c.cover_path ? <Image src={mediaUrl(c.cover_path)!} alt={`${c.title} cover`} fill sizes="160px" className="object-cover" /> : <p className="p-2 text-xs text-fg/55">No photo yet</p>}</div>
        <label className={`mt-2 block cursor-pointer text-center ${btn2}`}>{c.cover_path ? "Replace photo" : "Add photo"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => { cover(e.target.files?.[0]); e.target.value = ""; }} /></label>
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
      <p className="mt-2 text-sm text-fg/60">These photos appear under “Discover your style” on the homepage and as banners on each collection page. Tall (portrait) photos work best.</p>
      {rows === null ? <p className="mt-8 text-fg/60">Loading…</p> : (
        <ul className="mt-8 space-y-5">{rows.map((c, i) => <Row key={c.id + c.cover_path} c={c} first={i === 0} last={i === rows.length - 1} move={(d) => move(i, d)} reload={reload} />)}</ul>
      )}
      <form onSubmit={add} className="mt-10 flex flex-wrap items-end gap-3">
        <div className="flex-1"><label htmlFor="nc" className="mb-1 block text-sm">Add a new collection</label><input id="nc" required placeholder="Collection name" className={field} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <button className={btn}>Add</button>
      </form>
      {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
    </div>
  );
}
