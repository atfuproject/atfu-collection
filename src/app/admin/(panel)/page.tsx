"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canContent, canEnquiries, useProfile } from "@/components/admin/AdminShell";
import { fmt } from "@/components/admin/ui";

export default function Dashboard() {
  const me = useProfile();
  const [n, setN] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<any[]>([]);
  useEffect(() => {
    const sb = getBrowser()!;
    const count = async (table: string, col?: string, val?: string) => {
      let q = sb.from(table).select("id", { count: "exact", head: true });
      if (col) q = q.eq(col, val!);
      return (await q).count ?? 0;
    };
    (async () => {
      const r: Record<string, number> = {};
      if (canContent(me.role)) { r.designs = await count("designs"); r.published = await count("designs", "status", "published"); r.draft = await count("designs", "status", "draft"); }
      if (canEnquiries(me.role)) {
        r.enq = await count("enquiries"); r.new = await count("enquiries", "status", "new");
        r.contacted = await count("enquiries", "status", "contacted"); r.converted = await count("enquiries", "status", "converted");
        const { data } = await sb.from("enquiries").select("id,full_name,location,design_name,status,created_at").order("created_at", { ascending: false }).limit(6);
        setRecent(data ?? []);
      }
      setN(r);
    })();
  }, [me.role]);
  const cards: [string, string, boolean][] = [
    ["Total designs", "designs", canContent(me.role)], ["Published", "published", canContent(me.role)], ["Drafts", "draft", canContent(me.role)],
    ["Total enquiries", "enq", canEnquiries(me.role)], ["New", "new", canEnquiries(me.role)], ["Contacted", "contacted", canEnquiries(me.role)], ["Converted", "converted", canEnquiries(me.role)],
  ];
  return (
    <div>
      <h1 className="font-display text-4xl">Welcome{me.full_name ? `, ${me.full_name}` : ""}</h1>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.filter((c) => c[2]).map(([label, key]) => (
          <li key={key} className="border border-line/15 bg-surface p-4"><p className="text-sm text-fg/65">{label}</p><p className="mt-1 font-display text-4xl">{n[key] ?? "–"}</p></li>
        ))}
      </ul>
      {canEnquiries(me.role) && (
        <section className="mt-12">
          <div className="flex items-center justify-between"><h2 className="font-display text-2xl">Recent enquiries</h2><Link href="/admin/enquiries" className="text-sm text-gold">View all</Link></div>
          {recent.length ? (
            <ul className="mt-4 divide-y divide-line/10 border border-line/15">
              {recent.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                  <span><strong>{e.full_name}</strong>, {e.location}{e.design_name ? ` · ${e.design_name}` : ""}</span>
                  <span className="text-fg/60">{e.status} · {fmt(e.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-fg/65">No enquiries yet. They’ll appear here as soon as someone submits the form.</p>}
        </section>
      )}
      <p className="mt-12 text-sm text-fg/55">Charts, date filters and most-viewed designs arrive with the analytics phase.</p>
    </div>
  );
}
