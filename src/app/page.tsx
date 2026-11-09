import { Hero } from "@/components/Hero";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { waLink } from "@/lib/whatsapp";
import { getHeroImage } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 60;

export default async function Home() {
  const hero = await getHeroImage();
  return (
    <>
      <Hero image={hero ?? site.heroImage} />
      <CategoryCarousel />
      {/* Phase 3+: Signature Designs, Story, Lookbook, Why ATFU, Testimonials, Instagram */}
      <section className="mx-auto max-w-4xl px-5 py-28 text-center md:py-40">
        <h2 className="font-display text-5xl font-light md:text-7xl">Your style deserves a personal touch.</h2>
        <p className="mx-auto mt-6 max-w-lg text-fg/75">Discover a design you love and let us bring your vision to life.</p>
        <a href={waLink()} target="_blank" rel="noopener noreferrer" className="mt-10 inline-block bg-gold px-10 py-4 text-sm font-medium tracking-wide text-bg transition hover:brightness-110">Start a Conversation</a>
      </section>
    </>
  );
}
