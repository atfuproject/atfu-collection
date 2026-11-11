"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function PhotoGrid({ photos, title }: { photos: { src: string; alt: string }[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = photos.length;
  const next = useCallback(() => setOpen((v) => (v === null ? v : (v + 1) % n)), [n]);
  const prev = useCallback(() => setOpen((v) => (v === null ? v : (v - 1 + n) % n)), [n]);
  const isOpen = open !== null;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); };
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, [isOpen, next, prev]);

  const cur = open !== null ? photos[open] : null;
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.src}>
            <button onClick={() => setOpen(i)} aria-label={`View ${title} photograph ${i + 1} of ${n}`} className="group relative block aspect-[3/4] w-full overflow-hidden bg-surface">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {cur && (
          <motion.div role="dialog" aria-modal="true" aria-label={`${title} photographs`} className="fixed inset-0 z-[60] bg-black/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => setOpen(null)} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-12 w-12 place-items-center text-white"><X size={26} /></button>
            <p className="absolute left-5 top-5 text-sm text-white/70">{(open ?? 0) + 1} / {n}</p>
            <motion.div key={cur.src} className="absolute inset-0 touch-pan-y" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25} onDragEnd={(_, info) => { if (info.offset.x < -60) next(); else if (info.offset.x > 60) prev(); }}>
              <Image src={cur.src} alt={cur.alt} fill sizes="100vw" className="pointer-events-none object-contain p-2 md:p-12" />
            </motion.div>
            {n > 1 && (<>
              <button onClick={prev} aria-label="Previous photograph" className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-white"><ChevronLeft size={30} /></button>
              <button onClick={next} aria-label="Next photograph" className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-white"><ChevronRight size={30} /></button>
            </>)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
