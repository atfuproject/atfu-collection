"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canContent, useProfile } from "@/components/admin/AdminShell";
import { btn } from "@/components/admin/ui";
import { compress } from "@/lib/image";
import { mediaUrl } from "@/lib/media";

export default function HomepageAdmin() {
  const me = useProfile(); const sb = getBrowser()!;
  const [path, setPath] = useState<string | null>(null);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { sb.from("site_settings").select("value").eq("key", "hero").maybeSingle().then(({ data }) => setPath(data?.value?.path ?? null)); }, [sb]);
  if (!canContent(me.role)) return <p>You don’t have access to this page.</p>;

  async function upload(file?: File) {
    if (!file) return; setMsg("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 25 * 1024 * 1024) { setMsg("Use a JPG, PNG or WebP photo under 25 MB."); return; }
    setBusy(true);
    try {
      const blob = await compress(file, 3200, 0.92);
      const next = `site/hero-${Date.now()}.webp`;
      const up = await sb.storage.from("media").upload(next, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (up.error) throw up.error;
      const sv = await sb.from("site_settings").upsert({ key: "hero", value: { path: next }, updated_at: new Date().toISOString() });
      if (sv.error) throw sv.error;
      if (path) await sb.storage.from("media").remove([path]);
      setPath(next); setMsg("Saved. The homepage updates within a minute.");
    } catch (e: any) { setMsg(e.message ?? "Upload failed."); }
    setBusy(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl">Homepage</h1>
      <h2 className="mt-8 font-display text-2xl">Main banner photograph</h2>
      <p className="mt-1 text-sm text-fg/60">The large photo at the top of the homepage. A tall or square photo of the owner, with space around the head, crops best on phones.</p>
      <div className="relative mt-5 aspect-[4/5] max-w-sm overflow-hidden bg-surface">
        {path ? <Image src={mediaUrl(path)!} alt="Current homepage banner" fill sizes="384px" className="object-cover" /> : <p className="p-4 text-sm text-fg/55">No banner photo yet. The homepage shows a placeholder.</p>}
      </div>
      <label className={`mt-5 inline-block cursor-pointer ${btn}`}>{busy ? "Uploading…" : path ? "Replace photograph" : "Upload photograph"}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      {msg && <p role="status" className="mt-3 text-sm text-gold">{msg}</p>}
    </div>
  );
}
