"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canContent, useProfile } from "@/components/admin/AdminShell";
import { btn, field } from "@/components/admin/ui";
import { mediaUrl } from "@/lib/media";

export default function Designs() {
  const me = useProfile();
  const [rows, setRows] = useState<any[] | null>(null);
  const [status, setStatus] = useState(""); const [q, setQ] = useState("");
  useEffect(() => {
    getBrowser()!.from("designs").select("id,name,reference,status,featured,collections(title),design_images(path,is_cover,sort_order)").order("updated_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, []);
  if (!canContent(me.role)) return <p>You don’t have access to designs.</p>;
  const list = (rows ?? []).filter((d) => (!status || d.status === status) && (!q || `${d.name} ${d.reference}`.toLowerCase().includes(q.toLowerCase())));
  const thumb = (d: any) => mediaUrl([...d.design_images].sort((a: any, b: any) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)[0]?.path);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl">Designs</h1><Link href="/admin/designs/new" className={btn}>New design</Link></div>
      <div className="mt-6 flex flex-wrap gap-3">
        <input aria-label="Search designs" placeholder="Search name or reference" className={`${field} max-w-xs`} value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Filter by status" className={`${field} max-w-[10rem]`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
        </select>
      </div>
      {rows === null ? <p className="mt-8 text-fg/60">Loading…</p> : list.length === 0 ? (
        <p className="mt-10 text-fg/65">{rows.length ? "No designs match." : "No designs yet. Tap “New design” to add your first one."}</p>
      ) : (
        <ul className="mt-6 divide-y divide-line/10 border border-line/15">
          {list.map((d) => (
            <li key={d.id}>
              <Link href={`/admin/designs/${d.id}`} className="flex items-center gap-4 p-3 hover:bg-surface">
                <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-surface">{thumb(d) && <Image src={thumb(d)!} alt="" fill sizes="48px" className="object-cover" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-medium">{d.name}</span><span className="block text-sm text-fg/60">{d.reference} · {d.collections?.title}</span></span>
                <span className="text-right text-xs text-fg/65">{d.status}{d.featured ? " · featured" : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
