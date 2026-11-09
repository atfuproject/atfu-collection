"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canContent, useProfile } from "@/components/admin/AdminShell";
import { btn, btn2, field } from "@/components/admin/ui";
import { compress } from "@/lib/image";
import { mediaUrl } from "@/lib/media";

type T = { id: string; author_name: string; author_detail: string | null; quote: string; photo_path: string | null; published: boolean; featured: boolean };

function Row({ t, reload }: { t: T; reload: () => void }) {
  const sb = getBrowser()!;
  const [f, setF] = useState({ author_name: t.author_name, author_detail: t.author_detail ?? "", quote: t.quote, published: t.published, featured: t.featured });
  const [msg, setMsg] = useState("");
  const save = async () => { const { error } = await sb.from("testimonials").update({ ...f, author_detail: f.author_detail || null }).eq("id", t.id); setMsg(error ? error.message : "Saved."); };
  const del = async () => { if (!confirm("Delete this testimonial?")) return; if (t.photo_path) await sb.storage.from("media").remove([t.photo_path]); await sb.from("testimonials").delete().eq("id", t.id); reload(); };
  const photo = async (file?: File) => {
    if (!file) return;
    try {
      const blob = await compress(file, 800, 0.85); const path = `testimonials/${t.id}-${Date.now()}.webp`;
      const up = await sb.storage.from("media").upload(path, blob, { contentType: blob.type }); if (up.error) throw up.error;
      await sb.from("testimonials").update({ photo_path: path }).eq("id", t.id); if (t.photo_path) await sb.storage.from("media").remove([t.photo_path]); reload();
    } catch (e: any) { setMsg(e.message ?? "Upload failed."); }
  };
  return (
    <li className="space-y-3 border border-line/15 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input aria-label="Name" className={field} value={f.author_name} onChange={(e) => setF({ ...f, author_name: e.target.value })} />
        <input aria-label="Detail, for example a town" placeholder="Detail (optional)" className={field} value={f.author_detail} onChange={(e) => setF({ ...f, author_detail: e.target.value })} />
      </div>
      <textarea aria-label="Testimonial" rows={3} className={field} value={f.quote} onChange={(e) => setF({ ...f, quote: e.target.value })} />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[#C5A77D]" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} /> Published</label>
        <label className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[#C5A77D]" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> Featured (shown first)</label>
        {t.photo_path && <span className="relative h-10 w-10 overflow-hidden rounded-full"><Image src={mediaUrl(t.photo_path)!} alt="" fill sizes="40px" className="object-cover" /></span>}
        <label className={`cursor-pointer ${btn2} py-2`}>{t.photo_path ? "Replace photo" : "Add photo (with permission)"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { photo(e.target.files?.[0]); e.target.value = ""; }} /></label>
      </div>
      <div className="flex flex-wrap items-center gap-2"><button onClick={save} className={btn}>Save</button><button onClick={del} className={btn2}>Delete</button>{msg && <span role="status" className="text-sm text-gold">{msg}</span>}</div>
    </li>
  );
}

export default function TestimonialsAdmin() {
  const me = useProfile(); const sb = getBrowser()!;
  const [rows, setRows] = useState<T[] | null>(null); const [n, setN] = useState({ author_name: "", author_detail: "", quote: "" }); const [err, setErr] = useState("");
  const reload = useCallback(() => { sb.from("testimonials").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows((data ?? []) as T[])); }, [sb]);
  useEffect(reload, [reload]);
  if (!canContent(me.role)) return <p>You don’t have access to this page.</p>;
  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    const { error } = await sb.from("testimonials").insert({ author_name: n.author_name.trim(), author_detail: n.author_detail.trim() || null, quote: n.quote.trim() });
    if (error) setErr(error.message); else { setN({ author_name: "", author_detail: "", quote: "" }); reload(); }
  };
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl">Testimonials</h1>
      <p className="mt-2 text-sm text-fg/60">Only add words a customer has really said, and a photo only with their permission. The homepage section stays hidden until at least one is published.</p>
      <form onSubmit={add} className="mt-8 space-y-3 border border-line/15 p-4">
        <h2 className="font-display text-2xl">Add a testimonial</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required aria-label="Name" placeholder="Customer name" className={field} value={n.author_name} onChange={(e) => setN({ ...n, author_name: e.target.value })} />
          <input aria-label="Detail" placeholder="Detail (optional)" className={field} value={n.author_detail} onChange={(e) => setN({ ...n, author_detail: e.target.value })} />
        </div>
        <textarea required aria-label="Testimonial" rows={3} placeholder="What they said" className={field} value={n.quote} onChange={(e) => setN({ ...n, quote: e.target.value })} />
        {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
        <button className={btn}>Add (saved as hidden)</button>
      </form>
      {rows === null ? <p className="mt-8 text-fg/60">Loading…</p> : rows.length === 0 ? <p className="mt-8 text-fg/65">No testimonials yet.</p> : <ul className="mt-8 space-y-4">{rows.map((t) => <Row key={t.id + t.photo_path} t={t} reload={reload} />)}</ul>}
    </div>
  );
}
