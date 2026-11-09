"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Img } from "./Img";

const SPEED = 45;        // pixels per second of continuous drift
const PAUSE_MS = 8000;   // pause after a tap, swipe or click, then drift resumes from where it is

export function CategoryCarousel({ items }: { items: { slug: string; title: string; cover: string | null }[] }) {
  const n = items.length;
  const loop = [...items, ...items]; // second copy makes the loop seamless
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const inView = useRef(false);
  const hover = useRef(false);
  const pausedUntil = useRef(0);
  const reduce = useRef(false);
  const pos = useRef(0);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });

  const touch = () => { pausedUntil.current = Date.now() + PAUSE_MS; };
  const half = () => { const t = track.current; return t ? (t.children[n] as HTMLElement).offsetLeft - (t.children[0] as HTMLElement).offsetLeft : 0; };
  const pad = () => parseFloat(getComputedStyle(track.current!).paddingLeft);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => { inView.current = e.isIntersecting; }, { threshold: 0.1 });
    if (root.current) io.observe(root.current);
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const t = track.current; const dt = Math.min(now - last, 64) / 1000; last = now;
      if (t) {
        const paused = hover.current || drag.current.down || document.hidden || !inView.current || Date.now() < pausedUntil.current;
        if (paused) pos.current = t.scrollLeft;
        else {
          pos.current += (reduce.current ? SPEED / 2 : SPEED) * dt;
          const h = half(); if (h > 0 && pos.current >= h) pos.current -= h;
          t.scrollLeft = pos.current;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const onScroll = () => {
    const t = track.current; if (!t) return;
    const h = half(); if (h <= 0) return;
    if (Math.abs(t.scrollLeft - pos.current) > 3) touch();       // a person moved it, so pause the drift
    if (t.scrollLeft >= h) t.scrollLeft -= h;                      // seamless wrap while swiping forward
    else if (t.scrollLeft < 1) t.scrollLeft += h;                  // ...and backward
    const x = t.scrollLeft % h; let best = 0, d = Infinity;
    for (let i = 0; i < n; i++) { const diff = Math.abs((t.children[i] as HTMLElement).offsetLeft - pad() - x); if (diff < d) { d = diff; best = i; } }
    setActive(best);
  };

  const step = useCallback((dir: 1 | -1) => {
    const t = track.current; if (!t) return; touch();
    const card = (t.children[1] as HTMLElement).offsetLeft - (t.children[0] as HTMLElement).offsetLeft;
    t.scrollBy({ left: dir * card, behavior: "smooth" });
  }, []);
  const toDot = (i: number) => { const t = track.current; if (!t) return; touch(); t.scrollTo({ left: (t.children[i] as HTMLElement).offsetLeft - pad(), behavior: "smooth" }); };

  const down = (e: React.PointerEvent) => { touch(); if (e.pointerType !== "mouse") return; drag.current = { down: true, x: e.clientX, left: track.current!.scrollLeft, moved: false }; };
  const move = (e: React.PointerEvent) => { const d = drag.current; if (!d.down) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 4) d.moved = true; track.current!.scrollLeft = d.left - dx; };
  const up = () => { if (drag.current.down) { drag.current.down = false; touch(); } };

  if (!n) return null;
  return (
    <section ref={root} aria-label="Discover your style" className="py-24 md:py-32"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") hover.current = true; }} onPointerLeave={() => (hover.current = false)} onFocusCapture={touch}>
      <div className="mx-auto flex max-w-7xl items-end justify-between px-5 md:px-10">
        <h2 className="font-display text-4xl font-light md:text-6xl">Discover your style</h2>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => step(-1)} aria-label="Previous collection" className="grid h-12 w-12 place-items-center border border-fg/30 transition hover:border-gold hover:text-gold"><ChevronLeft size={20} /></button>
          <button onClick={() => step(1)} aria-label="Next collection" className="grid h-12 w-12 place-items-center border border-fg/30 transition hover:border-gold hover:text-gold"><ChevronRight size={20} /></button>
        </div>
      </div>
      <ul ref={track} onScroll={onScroll} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); drag.current.moved = false; } }}
        className="no-scrollbar relative mt-10 flex cursor-grab gap-4 overflow-x-auto px-5 active:cursor-grabbing md:gap-6 md:px-10">
        {loop.map((c, i) => (
          <li key={`${c.slug}-${i}`} aria-hidden={i >= n} className="w-[78vw] shrink-0 sm:w-[44vw] lg:w-[30vw]">
            <Link href={`/collections/${c.slug}`} draggable={false} tabIndex={i >= n ? -1 : 0} className="group relative block aspect-[3/4] overflow-hidden">
              <Img src={c.cover} alt={`${c.title} by ATFU COLLECTION`} sizes="(min-width:1024px) 30vw, 78vw" label={`${c.title} photograph placeholder`} className="transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-[#F5F1E9]">
                <h3 className="font-display text-3xl">{c.title}</h3>
                <span className="mt-2 inline-block border-b border-[#C5A77D] pb-1 text-sm text-[#C5A77D]">Discover collection</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Collection slides">
        {items.map((c, i) => (
          <button key={c.slug} role="tab" aria-selected={i === active} aria-label={`Show ${c.title}`} onClick={() => toDot(i)} className="grid h-8 w-8 place-items-center">
            <span className={`block h-px transition-all ${i === active ? "w-8 bg-gold" : "w-4 bg-fg/40"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
