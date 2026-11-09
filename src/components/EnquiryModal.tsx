"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { designEnquiryText, generalEnquiryText, waLink } from "@/lib/whatsapp";

export type EnquiryDesign = { slug: string; name: string; reference: string; category: string };
type State = { s: "form" } | { s: "saving" } | { s: "saved"; id: string; waUrl: string } | { s: "error"; msg: string; fallback: string };

const field = "w-full border border-fg/25 bg-transparent px-4 py-3 text-base outline-none transition focus:border-gold";

export function EnquireButton({ design, label = "Enquire about this design", className = "" }: { design?: EnquiryDesign; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (<>
    <button onClick={() => setOpen(true)} className={className || "w-full bg-gold px-8 py-4 text-sm font-medium tracking-wide text-bg transition hover:brightness-110"}>{label}</button>
    <EnquiryModal open={open} onClose={() => setOpen(false)} design={design} />
  </>);
}

export function EnquiryModal({ open, onClose, design }: { open: boolean; onClose: () => void; design?: EnquiryDesign }) {
  const [state, setState] = useState<State>({ s: "form" });
  const [f, setF] = useState({ name: "", location: "", contact: "", message: "", consent: false, website: "" });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, [open, onClose]);
  useEffect(() => { if (!open) setTimeout(() => setState({ s: "form" }), 300); }, [open]);

  const clientWa = () => {
    const url = `${window.location.origin}${design ? `/designs/${design.slug}` : ""}`;
    return waLink(design
      ? designEnquiryText({ name: f.name, location: f.location, designName: design.name, reference: design.reference, category: design.category, url, message: f.message })
      : generalEnquiryText(f.name, f.location, f.message));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ s: "saving" });
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, designSlug: design?.slug }) });
      const j = await res.json();
      if (!res.ok) { setState({ s: "error", msg: j.error ?? "Something went wrong.", fallback: clientWa() }); return; }
      setState({ s: "saved", id: j.id, waUrl: j.waUrl });
    } catch {
      setState({ s: "error", msg: "We couldn’t save your enquiry. Check your connection and try again.", fallback: clientWa() });
    }
  }
  const handoff = (id: string) => { fetch(`/api/enquiries/${id}/handoff`, { method: "POST", keepalive: true }).catch(() => {}); };
  const busy = state.s === "saving";

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="enq-title" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92svh] w-full overflow-y-auto bg-bg p-6 md:max-w-lg md:p-10">
            <button onClick={onClose} aria-label="Close" className="absolute right-2 top-2 grid h-11 w-11 place-items-center"><X size={20} /></button>
            <h2 id="enq-title" className="font-display text-3xl">{design ? "Enquire about this design" : "Start a conversation"}</h2>
            {design && <p className="mt-1 text-sm text-fg/65">{design.name} · Ref {design.reference} · {design.category}</p>}

            {state.s === "saved" ? (
              <div className="mt-6 space-y-5">
                <p className="text-fg/80">Your enquiry details are saved. WhatsApp opens with your message ready; you still need to press send there.</p>
                <a href={state.waUrl} target="_blank" rel="noopener noreferrer" onClick={() => handoff(state.id)} className="block bg-gold py-4 text-center font-medium text-bg">Continue to WhatsApp</a>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div><label htmlFor="e-name" className="mb-1 block text-sm">Full name</label><input id="e-name" required maxLength={120} autoComplete="name" className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
                <div><label htmlFor="e-loc" className="mb-1 block text-sm">Country or location</label><input id="e-loc" required maxLength={120} autoComplete="country-name" className={field} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
                <div><label htmlFor="e-tel" className="mb-1 block text-sm">Contact number <span className="text-fg/50">(optional)</span></label><input id="e-tel" type="tel" maxLength={40} autoComplete="tel" className={field} value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></div>
                <div><label htmlFor="e-msg" className="mb-1 block text-sm">Your message</label><textarea id="e-msg" required rows={4} maxLength={2000} placeholder="Tell us what you have in mind, such as the occasion or timing." className={field} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
                <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
                <label className="flex items-start gap-3 text-sm text-fg/75">
                  <input type="checkbox" required checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-1 h-5 w-5 accent-[#C5A77D]" />
                  <span>I agree that ATFU COLLECTION may store these details to respond to my enquiry. See the <Link href="/privacy" className="underline hover:text-gold">Privacy Policy</Link>.</span>
                </label>
                {state.s === "error" && (
                  <div role="alert" className="border border-gold/50 p-4 text-sm">
                    <p>{state.msg}</p>
                    <a href={state.fallback} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-gold underline">Continue to WhatsApp without saving</a>
                  </div>
                )}
                <button disabled={busy} className="w-full bg-gold py-4 font-medium text-bg transition hover:brightness-110 disabled:opacity-60">{busy ? "Saving…" : "Save and continue"}</button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
