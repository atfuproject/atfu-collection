# ATFU COLLECTION: Setup

## 1. Supabase
1. Create a project. Run `supabase/migrations/0001_schema.sql` in the SQL editor (also creates the `media` bucket and seeds the 5 collections).
2. Auth > Providers: enable Email. **Disable public sign-ups** (Auth > Settings) so there is no staff self-registration.
3. Create the owner user (Auth > Users > Add user), then promote them:
   `insert into profiles (id, full_name, role) values ('<user-uuid>', 'Owner', 'owner');`

## 2. Environment
Copy `.env.example` to `.env.local`, fill it in. Add the same variables in Vercel > Settings > Environment Variables.
The service-role key is used only in server routes (enquiry submit, WhatsApp handoff, staff invites).

## 3. Vercel + GitHub
Push to GitHub, import the repo in Vercel, add env vars, deploy. Set `NEXT_PUBLIC_SITE_URL` to the `*.vercel.app` URL.

## 4. Custom domain (later)
Vercel > Domains > add domain, set DNS records, then update `NEXT_PUBLIC_SITE_URL` and redeploy. No code changes needed.

## Design decisions
- Enquiries have no public policy; they are written by a server route (validated, service role). Handoff clicks set `whatsapp_handoff_at` and log a separate `whatsapp_handoff` event. A handoff is never a sale; only `converted` status counts as one.
- Permissions are enforced in RLS via `has_role()`, not just hidden UI.
