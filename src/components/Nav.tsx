"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { navLinks } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => { const f = () => setSolid(window.scrollY > 40); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open]);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${solid || open ? "bg-bg/90 backdrop-blur" : "bg-transparent"}`}>
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-10">
        <Link href="/" aria-label="ATFU COLLECTION home" onClick={() => setOpen(false)}><Logo /></Link>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => <Link key={l.href} href={l.href} className="text-sm tracking-wide text-fg/80 transition hover:text-gold">{l.label}</Link>)}
          <ThemeToggle />
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="border border-gold px-5 py-3 text-sm text-gold transition hover:bg-gold hover:text-bg">Enquire on WhatsApp</a>
        </div>
        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="grid h-11 w-11 place-items-center">{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 top-16 flex flex-col justify-between bg-bg px-5 pb-10 pt-10 md:hidden">
            <ul className="space-y-2">
              {["Home", ...navLinks.map((l) => l.label)].map((label, i) => {
                const href = i === 0 ? "/" : navLinks[i - 1].href;
                return (
                  <motion.li key={href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                    <Link href={href} onClick={() => setOpen(false)} className="block py-2 font-display text-5xl">{label}</Link>
                  </motion.li>
                );
              })}
            </ul>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="block bg-gold py-4 text-center font-medium text-bg">Enquire on WhatsApp</a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
