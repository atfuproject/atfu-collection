import Link from "next/link";
export default function NotFound() {
  return (
    <section className="grid min-h-[80svh] place-items-center px-5 text-center">
      <div>
        <p className="font-display text-xl italic text-gold">404</p>
        <h1 className="mt-3 font-display text-5xl font-light md:text-7xl">This page isn’t in the collection.</h1>
        <Link href="/" className="mt-8 inline-block border border-gold px-8 py-4 text-sm text-gold transition hover:bg-gold hover:text-bg">Back to home</Link>
      </div>
    </section>
  );
}
