"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { getBrowser } from "@/lib/supabase/browser";
import { Logo } from "@/components/Logo";

export type Role = "owner" | "content_manager" | "enquiry_manager";
export type Profile = { id: string; full_name: string; role: Role };
const Ctx = createContext<Profile | null>(null);
export const useProfile = () => useContext(Ctx)!;
export const canContent = (r: Role) => r === "owner" || r === "content_manager";
export const canEnquiries = (r: Role) => r === "owner" || r === "enquiry_manager";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied">("loading");
  const path = usePathname(); const router = useRouter();
  useEffect(() => {
    const sb = getBrowser(); if (!sb) { setState("denied"); return; }
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.replace("/admin/login"); return; }
      const { data } = await sb.from("profiles").select("id,full_name,role,active").eq("id", user.id).maybeSingle();
      if (data?.active) { setProfile(data as Profile); setState("ready"); } else setState("denied");
    })();
  }, [router]);
  const out = async () => { await getBrowser()?.auth.signOut(); router.replace("/admin/login"); };

  if (state === "loading") return <p className="p-10 text-fg/60">Loading…</p>;
  if (state === "denied" || !profile) return (
    <div className="mx-auto max-w-md p-10">
      <h1 className="font-display text-3xl">No access</h1>
      <p className="mt-3 text-fg/70">This account isn’t set up as ATFU staff. Ask the owner to add it, or check the setup steps in the README.</p>
      <button onClick={out} className="mt-6 border border-fg/30 px-4 py-3 text-sm">Sign out</button>
    </div>
  );
  const links = [
    { href: "/admin", label: "Dashboard", show: true },
    { href: "/admin/designs", label: "Designs", show: canContent(profile.role) },
    { href: "/admin/lookbook", label: "Lookbook", show: canContent(profile.role) },
    { href: "/admin/collections", label: "Collections", show: canContent(profile.role) },
    { href: "/admin/testimonials", label: "Testimonials", show: canContent(profile.role) },
    { href: "/admin/homepage", label: "Homepage", show: canContent(profile.role) },
    { href: "/admin/enquiries", label: "Enquiries", show: canEnquiries(profile.role) },
  ].filter((l) => l.show);
  return (
    <Ctx.Provider value={profile}>
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-line/15 bg-bg">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/admin"><Logo className="h-16" /></Link>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-fg/60 sm:inline">{profile.full_name || "Staff"} · {profile.role.replace("_", " ")}</span>
              <button onClick={out} className="border border-fg/30 px-3 py-2 hover:border-gold hover:text-gold">Sign out</button>
            </div>
          </div>
          <nav aria-label="Admin" className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
            {links.map((l) => {
              const on = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
              return <Link key={l.href} href={l.href} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm ${on ? "border-gold text-gold" : "border-transparent text-fg/70 hover:text-fg"}`}>{l.label}</Link>;
            })}
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </Ctx.Provider>
  );
}
