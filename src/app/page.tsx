import { Hero } from "@/components/Hero";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { InstagramSection, LookbookSection, SignatureDesigns, Story, Testimonials, WhyAtfu } from "@/components/home/Sections";
import { waLink } from "@/lib/whatsapp";
import { getBiography, getCollections, getFeaturedDesigns, getHeroImage, getStories, getTestimonials, mediaUrl } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 60;

export default async function Home() {
  const [hero, cols, featured, bio, tests, stories] = await Promise.all([getHeroImage(), getCollections(), getFeaturedDesigns(), getBiography(), getTestimonials(), getStories(3)]);
  const photo = hero ?? site.heroImage;
  return (
    <>
      <Hero image={photo} />
      <CategoryCarousel items={cols.map((c) => ({ slug: c.slug, title: c.title, cover: mediaUrl(c.cover_path) }))} />
      <SignatureDesigns designs={featured} />
      <Story image={photo} bio={bio} />
      <LookbookSection stories={stories} />
      <WhyAtfu />
      <Testimonials items={tests} />
      <InstagramSection />
      <section className="mx-auto max-w-4xl px-5 py-28 text-center md:py-40">
        <h2 className="font-display text-5xl font-light md:text-7xl">Your style deserves a personal touch.</h2>
        <p className="mx-auto mt-6 max-w-lg text-fg/75">Discover a design you love and let us bring your vision to life.</p>
        <a href={waLink()} target="_blank" rel="noopener noreferrer" className="mt-10 inline-block bg-gold px-10 py-4 text-sm font-medium tracking-wide text-bg transition hover:brightness-110">Start a Conversation</a>
      </section>
    </>
  );
}
