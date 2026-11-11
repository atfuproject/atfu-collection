"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canContent, useProfile } from "@/components/admin/AdminShell";
import { btn, field } from "@/components/admin/ui";
import { mediaUrl } from "@/lib/media";

export default function LookbookAdmin() {
  const me = useProfile();
  const [rows, setRows] = useState<any[] | null>(null); const [status, setStatus] = useState("");
  useEffect(() => { getBrowser()!.from("lookbook_stories").select("id,title,edit_category,status,featured,cover_path").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? [])); }, []);
  if (!canContent(me.role)) return <p>You don’t have access to this page.</p>;
  const list = (rows ?? []).filter((r) => !status || r.status === status);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl">Lookbook</h1><Link href="/admin/lookbook/new" className={btn}>New story</Link></div>
      <select aria-label="Filter by status" className={`${field} mt-6 max-w-[10rem]`} value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
      </select>
      {rows === null ? <p className="mt-8 text-fg/60">Loading…</p> : list.length === 0 ? <p className="mt-10 text-fg/65">{rows.length ? "No stories match." : "No stories yet. Tap “New story” to write your first one."}</p> : (
        <ul className="mt-6 divide-y divide-line/10 border border-line/15">
          {list.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/lookbook/${r.id}`} className="flex items-center gap-4 p-3 hover:bg-surface">
                <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-surface">{r.cover_path && <Image src={mediaUrl(r.cover_path)!} alt="" fill sizes="48px" className="object-cover" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-medium">{r.title}</span><span className="block text-sm text-fg/60">{r.edit_category}</span></span>
                <span className="text-xs text-fg/65">{r.status}{r.featured ? " · featured" : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
