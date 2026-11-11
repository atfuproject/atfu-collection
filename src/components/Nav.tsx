"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const path = usePathname();
  const filled = open || solid || path !== "/";
  const overHero = !filled;
  const items = [{ href: "/", label: "Home" }, ...navLinks];
  return (
    <>
      {/* The menu overlay is a sibling of the header, not a child: a blurred header would otherwise trap a fixed child inside its own height. */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${open ? "bg-bg" : filled ? "bg-bg/90 backdrop-blur" : "[--fg:245_241_233] [--gold:197_167_125]"}`}>
        {/* On the homepage photo the header is transparent: a dark fade keeps the logo and links readable on any image. */}
        {overHero && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />}
        <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 md:px-10">
          <Link href="/" aria-label="ATFU COLLECTION home" onClick={() => setOpen(false)}><Logo className={`transition-all duration-300 ${solid ? "h-14 md:h-16" : "h-20 md:h-28"} ${overHero ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]" : ""}`} /></Link>
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
      </header>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-bg px-5 pb-10 pt-28 md:hidden">
            <ul className="space-y-2">
              {items.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block py-2 font-display text-5xl">{l.label}</Link>
                </motion.li>
              ))}
            </ul>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="mt-10 block bg-gold py-4 text-center font-medium text-bg">Enquire on WhatsApp</a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
