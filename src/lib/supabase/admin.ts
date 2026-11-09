// SERVER ONLY. Uses the service-role key, which bypasses RLS. Import only from route handlers / server actions.
import { createClient } from "@supabase/supabase-js";
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
