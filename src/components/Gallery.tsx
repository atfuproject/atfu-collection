"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Img } from "./Img";

export function Gallery({ images, name }: { images: { src: string; alt: string }[]; name: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const n = images.length;
  const next = useCallback(() => setI((v) => (v + 1) % n), [n]);
  const prev = useCallback(() => setI((v) => (v - 1 + n) % n), [n]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); };
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, [open, next, prev]);

  if (!n) return <div className="relative aspect-[4/5] bg-surface"><Img src={null} alt={name} label="Photographs coming soon" /></div>;
  const cur = images[i];
  return (
    <div>
      <button onClick={() => setOpen(true)} aria-label={`View ${name} full screen`} className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-surface">
        <AnimatePresence mode="popLayout">
          <motion.div key={cur.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <Image src={cur.src} alt={cur.alt} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </button>
      {n > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((im, k) => (
            <li key={im.src} className="shrink-0">
              <button onClick={() => setI(k)} aria-label={`Show photograph ${k + 1} of ${n}`} aria-current={k === i} className={`relative block h-20 w-16 overflow-hidden bg-surface ring-offset-2 ring-offset-bg ${k === i ? "ring-1 ring-gold" : "opacity-60 hover:opacity-100"}`}>
                <Image src={im.src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-modal="true" aria-label={`${name} photographs`} className="fixed inset-0 z-[60] bg-black/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-12 w-12 place-items-center text-white"><X size={26} /></button>
            <p className="absolute left-5 top-5 text-sm text-white/70">{i + 1} / {n}</p>
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
    </div>
  );
}
