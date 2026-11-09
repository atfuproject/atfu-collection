"use client";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Img } from "./Img";
import { site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

const words = "Tailored to make a statement.".split(" ");

export function Hero({ image = null }: { image?: string | null }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, reduce ? 0 : 110]);
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      {/* single static image, never auto-rotates */}
      <motion.div style={{ y }} className="absolute inset-x-0 -top-10 bottom-0 md:left-[38%]">
        <Img src={image} alt="The founder of ATFU COLLECTION" priority label="Owner photograph placeholder" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent md:bg-gradient-to-r md:from-bg md:via-bg/70 md:to-transparent" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-32 md:px-10 md:pb-28">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="mb-5 font-display text-xl italic text-gold md:text-2xl">{site.tagline}</motion.p>
        <h1 className="max-w-3xl font-display text-[3.4rem] font-light leading-[0.95] sm:text-7xl md:text-8xl" aria-label="Tailored to make a statement.">
          {words.map((w, i) => (
            <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom" aria-hidden>
              <motion.span className="inline-block" initial={{ y: reduce ? 0 : "105%" }} animate={{ y: 0 }} transition={{ delay: 0.3 + i * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
            </span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }} className="mt-6 max-w-md text-base leading-relaxed text-fg/75">
          Distinctive designs. Exceptional craftsmanship. A style that speaks before you do.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.8 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/collections" className="bg-gold px-8 py-4 text-center text-sm font-medium tracking-wide text-bg transition hover:brightness-110">Explore the Collection</Link>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="border border-fg/40 px-8 py-4 text-center text-sm tracking-wide transition hover:border-gold hover:text-gold">Enquire on WhatsApp</a>
        </motion.div>
      </div>
    </section>
  );
}
