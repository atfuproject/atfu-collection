"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Img } from "./Img";
import { collections } from "@/lib/site";

const PAUSE_MS = 8000;
export function CategoryCarousel() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const inView = useRef(false);
  const hover = useRef(false);
  const pausedUntil = useRef(0);
  const reduce = useRef(false);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const n = collections.length;

  const go = useCallback((i: number) => {
    const t = track.current; if (!t) return;
    const el = t.children[(i + n) % n] as HTMLElement;
    t.scrollTo({ left: el.offsetLeft - parseFloat(getComputedStyle(t).paddingLeft), behavior: reduce.current ? "auto" : "smooth" });
  }, [n]);
  const touch = () => { pausedUntil.current = Date.now() + PAUSE_MS; };

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => { inView.current = e.isIntersecting; }, { threshold: 0.4 });
    if (root.current) io.observe(root.current);
    const id = setInterval(() => {
      if (reduce.current || !inView.current || hover.current || document.hidden || Date.now() < pausedUntil.current) return;
      go(activeRef.current + 1);
    }, 4500);
    return () => { io.disconnect(); clearInterval(id); };
  }, [go]);

  const onScroll = () => {
    const t = track.current; if (!t) return;
    const pad = parseFloat(getComputedStyle(t).paddingLeft);
    let best = 0, d = Infinity;
    Array.from(t.children).forEach((c, i) => { const diff = Math.abs((c as HTMLElement).offsetLeft - pad - t.scrollLeft); if (diff < d) { d = diff; best = i; } });
    activeRef.current = best; setActive(best);
  };
  const down = (e: React.PointerEvent) => { if (e.pointerType !== "mouse") return; const t = track.current!; drag.current = { down: true, x: e.clientX, left: t.scrollLeft, moved: false }; t.style.scrollSnapType = "none"; touch(); };
  const move = (e: React.PointerEvent) => { const d = drag.current; if (!d.down) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 4) d.moved = true; track.current!.scrollLeft = d.left - dx; };
  const up = () => { const d = drag.current; if (!d.down) return; d.down = false; const t = track.current!; t.style.scrollSnapType = ""; go(activeRef.current); };

  return (
    <section ref={root} aria-label="Discover your style" className="py-24 md:py-32" onMouseEnter={() => (hover.current = true)} onMouseLeave={() => (hover.current = false)} onFocusCapture={touch} onTouchStart={touch}>
      <div className="mx-auto flex max-w-7xl items-end justify-between px-5 md:px-10">
        <h2 className="font-display text-4xl font-light md:text-6xl">Discover your style</h2>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => { touch(); go(active - 1); }} aria-label="Previous collection" className="grid h-12 w-12 place-items-center border border-fg/30 transition hover:border-gold hover:text-gold"><ChevronLeft size={20} /></button>
          <button onClick={() => { touch(); go(active + 1); }} aria-label="Next collection" className="grid h-12 w-12 place-items-center border border-fg/30 transition hover:border-gold hover:text-gold"><ChevronRight size={20} /></button>
        </div>
      </div>
      <ul ref={track} onScroll={onScroll} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); drag.current.moved = false; } }}
        className="no-scrollbar relative mt-10 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto px-5 active:cursor-grabbing md:gap-6 md:px-10 [scroll-padding-left:1.25rem] md:[scroll-padding-left:2.5rem]">
        {collections.map((c) => (
          <li key={c.slug} className="w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[30vw]">
            <Link href={`/collections/${c.slug}`} draggable={false} className="group relative block aspect-[3/4] overflow-hidden">
              <Img src={c.cover} alt={`${c.title} by ATFU COLLECTION`} sizes="(min-width:1024px) 30vw, 78vw" label={`${c.title} photograph placeholder`} className="transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-[#F5F1E9]">
                <h3 className="font-display text-3xl">{c.title}</h3>
                <span className="mt-2 inline-block border-b border-[#C5A77D] pb-1 text-sm text-[#C5A77D]">Discover collection</span>
              </div>
            </Link>
          </li>
        ))}
        <li aria-hidden className="w-px shrink-0" />
      </ul>
      <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Collection slides">
        {collections.map((c, i) => (
          <button key={c.slug} role="tab" aria-selected={i === active} aria-label={`Show ${c.title}`} onClick={() => { touch(); go(i); }} className="grid h-8 w-8 place-items-center">
            <span className={`block h-px transition-all ${i === active ? "w-8 bg-gold" : "w-4 bg-fg/40"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
