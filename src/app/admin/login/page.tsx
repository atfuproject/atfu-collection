"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowser } from "@/lib/supabase/browser";
import { Logo } from "@/components/Logo";
import { btn, field } from "@/components/admin/ui";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const sb = getBrowser();
  async function go(e: React.FormEvent) {
    e.preventDefault(); if (!sb) return; setBusy(true); setErr("");
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { setErr("Email or password is incorrect."); setBusy(false); return; }
    router.replace("/admin"); router.refresh();
  }
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={go} className="w-full max-w-sm space-y-4">
        <div className="mb-8"><Logo className="h-28" /></div>
        <h1 className="font-display text-4xl">Staff sign in</h1>
        {!sb && <p role="alert" className="border border-gold/50 p-3 text-sm">Supabase isn’t connected yet. Add the environment variables in Vercel and redeploy.</p>}
        <div><label htmlFor="em" className="mb-1 block text-sm">Email</label><input id="em" type="email" required autoComplete="username" className={field} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label htmlFor="pw" className="mb-1 block text-sm">Password</label><input id="pw" type="password" required autoComplete="current-password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
        <button disabled={busy || !sb} className={`w-full ${btn}`}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
