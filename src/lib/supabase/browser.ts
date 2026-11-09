"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | null = null;
// Runs as the signed-in staff member. Every permission is enforced by Row Level Security in the database.
export function getBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return (client ??= createBrowserClient(url, key));
}
