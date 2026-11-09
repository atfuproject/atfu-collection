import Link from "next/link";
import { Img } from "./Img";
import type { CardData } from "@/lib/data";
export function DesignCard({ d }: { d: CardData }) {
  return (
    <Link href={`/designs/${d.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <Img src={d.cover} alt={d.alt} sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" label="Photograph placeholder" className="transition duration-700 group-hover:scale-105" />
      </div>
      <div className="mt-3">
        <h3 className="font-display text-2xl leading-tight">{d.name}</h3>
        <p className="mt-1 flex items-center justify-between text-sm text-fg/60">
          <span>{d.collection ?? d.reference}</span>
          <span className="border-b border-transparent text-gold transition group-hover:border-gold">View design</span>
        </p>
      </div>
    </Link>
  );
}
