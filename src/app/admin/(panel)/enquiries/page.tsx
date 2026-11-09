"use client";
import { useCallback, useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { canEnquiries, useProfile } from "@/components/admin/AdminShell";
import { btn, btn2, field, fmt } from "@/components/admin/ui";

const STATUSES = ["new", "contacted", "converted", "closed"];

export default function Enquiries() {
  const me = useProfile(); const sb = getBrowser()!;
  const [rows, setRows] = useState<any[] | null>(null);
  const [status, setStatus] = useState(""); const [q, setQ] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]); const [note, setNote] = useState("");

  const load = useCallback(() => { sb.from("enquiries").select("*").order("created_at", { ascending: false }).limit(500).then(({ data }) => setRows(data ?? [])); }, [sb]);
  useEffect(load, [load]);
  const loadNotes = useCallback((id: string) => { sb.from("enquiry_notes").select("id,note,created_at,profiles(full_name)").eq("enquiry_id", id).order("created_at", { ascending: false }).then(({ data }) => setNotes(data ?? [])); }, [sb]);
  if (!canEnquiries(me.role)) return <p>You don’t have access to enquiries.</p>;

  const list = (rows ?? []).filter((e) =>
    (!status || e.status === status) && (!from || e.created_at >= from) && (!to || e.created_at <= `${to}T23:59:59`) &&
    (!q || `${e.full_name} ${e.location} ${e.design_name ?? ""} ${e.design_reference ?? ""} ${e.message} ${e.contact_number ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const toggle = (id: string) => { setOpen(open === id ? null : id); setNote(""); if (open !== id) loadNotes(id); };
  const setSt = async (id: string, s: string) => { await sb.from("enquiries").update({ status: s }).eq("id", id); load(); };
  const addNote = async (id: string) => { if (!note.trim()) return; await sb.from("enquiry_notes").insert({ enquiry_id: id, author_id: me.id, note: note.trim() }); setNote(""); loadNotes(id); };
  const csv = () => {
    const cols = ["created_at", "full_name", "location", "contact_number", "design_name", "design_reference", "collection_title", "status", "whatsapp_handoff_at", "message"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = [cols.join(","), ...list.map((e) => cols.map((c) => esc(e[c])).join(","))].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" })); a.download = `atfu-enquiries-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl">Enquiries</h1><button onClick={csv} className={btn2} disabled={!list.length}>Export CSV</button></div>
      <p className="mt-2 max-w-xl text-sm text-fg/60">“WhatsApp opened” means the visitor pressed the button. It does not mean a message was sent or a sale was made. Mark an enquiry Converted only when it truly is.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <input aria-label="Search enquiries" placeholder="Search" className={field} value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Filter by status" className={field} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <input aria-label="From date" type="date" className={field} value={from} onChange={(e) => setFrom(e.target.value)} />
        <input aria-label="To date" type="date" className={field} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {rows === null ? <p className="mt-8 text-fg/60">Loading…</p> : list.length === 0 ? <p className="mt-10 text-fg/65">{rows.length ? "No enquiries match these filters." : "No enquiries yet."}</p> : (
        <ul className="mt-6 divide-y divide-line/10 border border-line/15">
          {list.map((e) => (
            <li key={e.id}>
              <button onClick={() => toggle(e.id)} aria-expanded={open === e.id} className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left hover:bg-surface">
                <span><strong>{e.full_name}</strong> · {e.location}{e.design_name ? ` · ${e.design_name}` : ""}</span>
                <span className="text-xs text-fg/65">{e.status} · {fmt(e.created_at)}</span>
              </button>
              {open === e.id && (
                <div className="space-y-4 bg-surface p-4 text-sm">
                  <p className="whitespace-pre-line">{e.message}</p>
                  <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                    <div><dt className="inline text-fg/55">Contact: </dt><dd className="inline">{e.contact_number ? <a href={`tel:${e.contact_number}`} className="text-gold">{e.contact_number}</a> : "not given"}</dd></div>
                    <div><dt className="inline text-fg/55">Design: </dt><dd className="inline">{e.design_name ? `${e.design_name} (${e.design_reference}), ${e.collection_title}` : "General enquiry"}</dd></div>
                    <div><dt className="inline text-fg/55">WhatsApp opened: </dt><dd className="inline">{e.whatsapp_handoff_at ? fmt(e.whatsapp_handoff_at) : "not recorded"}</dd></div>
                    <div><dt className="inline text-fg/55">Region: </dt><dd className="inline">{e.is_kenya ? "Kenya" : "International or unclear"}</dd></div>
                  </dl>
                  <div><label htmlFor={`s-${e.id}`} className="mb-1 block">Status</label><select id={`s-${e.id}`} className={`${field} max-w-[12rem]`} value={e.status} onChange={(ev) => setSt(e.id, ev.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div>
                    <label htmlFor={`n-${e.id}`} className="mb-1 block">Private notes</label>
                    <div className="flex gap-2"><input id={`n-${e.id}`} className={field} value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Add a note" /><button onClick={() => addNote(e.id)} className={btn}>Add</button></div>
                    <ul className="mt-3 space-y-2">{notes.map((n) => <li key={n.id} className="border-l-2 border-gold/60 pl-3"><p>{n.note}</p><p className="text-xs text-fg/55">{n.profiles?.full_name || "Staff"} · {fmt(n.created_at)}</p></li>)}</ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
