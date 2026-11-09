-- ATFU COLLECTION: core schema + RLS
create extension if not exists "pgcrypto";

create type app_role as enum ('owner','content_manager','enquiry_manager');
create type publish_status as enum ('draft','published','archived');
create type enquiry_status as enum ('new','contacted','converted','closed');
create type event_type as enum ('page_view','design_view','collection_view','enquiry_submit','whatsapp_handoff');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role app_role not null default 'enquiry_manager',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null default '',
  cover_path text,
  sort_order int not null default 0,
  visible boolean not null default true,
  seo_title text, seo_description text,
  created_at timestamptz not null default now()
);

create table designs (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete restrict,
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  reference text unique not null,
  name text not null,
  description text not null default '',
  status publish_status not null default 'draft',
  featured boolean not null default false,
  featured_order int,
  seo_title text, seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on designs (collection_id, status);

create table design_images (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references designs(id) on delete cascade,
  path text not null,
  alt text not null default '',
  is_cover boolean not null default false,
  sort_order int not null default 0
);
create unique index one_cover_per_design on design_images (design_id) where is_cover;

create table lookbook_stories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  edit_category text not null default 'Signature ATFU Designs',
  description text not null default '',
  cover_path text,
  collection_id uuid references collections(id) on delete set null,
  status publish_status not null default 'draft',
  featured boolean not null default false,
  published_at timestamptz,
  seo_title text, seo_description text,
  created_at timestamptz not null default now()
);

create table lookbook_images (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references lookbook_stories(id) on delete cascade,
  path text not null,
  alt text not null default '',
  sort_order int not null default 0
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  design_id uuid references designs(id) on delete set null,
  design_name text, design_reference text, collection_title text, page_url text,
  full_name text not null check (char_length(full_name) between 1 and 120),
  location text not null check (char_length(location) between 1 and 120),
  is_kenya boolean,
  contact_number text check (char_length(contact_number) <= 40),
  message text not null check (char_length(message) <= 2000),
  consent boolean not null check (consent),
  status enquiry_status not null default 'new',
  whatsapp_handoff_at timestamptz,
  created_at timestamptz not null default now()
);
create index on enquiries (status, created_at desc);

create table enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_detail text,
  quote text not null,
  photo_path text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- key/value settings: business, homepage text, biography, announcements
create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table analytics_events (
  id bigint generated always as identity primary key,
  type event_type not null,
  path text check (char_length(path) <= 300),
  design_id uuid references designs(id) on delete set null,
  collection_id uuid references collections(id) on delete set null,
  referrer text check (char_length(referrer) <= 300),
  country text,
  created_at timestamptz not null default now()
);
create index on analytics_events (type, created_at desc);

-- role helpers
create function public.has_role(roles app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and active and role = any(roles));
$$;

-- profiles
alter table profiles enable row level security;
create policy "own profile read" on profiles for select using (id = auth.uid() or has_role('{owner}'));
create policy "owner manages profiles" on profiles for all using (has_role('{owner}')) with check (has_role('{owner}'));

-- public-readable content, staff-writable
alter table collections enable row level security;
create policy "public read visible collections" on collections for select using (visible or has_role('{owner,content_manager}'));
create policy "content write collections" on collections for all using (has_role('{owner,content_manager}')) with check (has_role('{owner,content_manager}'));

alter table designs enable row level security;
create policy "public read published designs" on designs for select using (status = 'published' or has_role('{owner,content_manager}'));
create policy "content write designs" on designs for all using (has_role('{owner,content_manager}')) with check (has_role('{owner,content_manager}'));

alter table design_images enable row level security;
create policy "public read images of published designs" on design_images for select
  using (exists (select 1 from designs d where d.id = design_id and d.status = 'published') or has_role('{owner,content_manager}'));
create policy "content write design images" on design_images for all using (has_role('{owner,content_manager}')) with check (has_role('{owner,content_manager}'));

alter table lookbook_stories enable row level security;
create policy "public read published stories" on lookbook_stories for select using (status = 'published' or has_role('{owner,content_manager}'));
create policy "content write stories" on lookbook_stories for all using (has_role('{owner,content_manager}')) with check (has_role('{owner,content_manager}'));

alter table lookbook_images enable row level security;
create policy "public read story images" on lookbook_images for select
  using (exists (select 1 from lookbook_stories s where s.id = story_id and s.status = 'published') or has_role('{owner,content_manager}'));
create policy "content write story images" on lookbook_images for all using (has_role('{owner,content_manager}')) with check (has_role('{owner,content_manager}'));

alter table testimonials enable row level security;
create policy "public read published testimonials" on testimonials for select using (published or has_role('{owner,content_manager}'));
create policy "content write testimonials" on testimonials for all using (has_role('{owner,content_manager}')) with check (has_role('{owner,content_manager}'));

alter table site_settings enable row level security;
create policy "public read settings" on site_settings for select using (true);
create policy "owner and content write settings" on site_settings for all using (has_role('{owner,content_manager}')) with check (has_role('{owner,content_manager}'));
-- NOTE: restrict critical keys (e.g. 'business') to owner in the server action layer.

-- enquiries: NO public access. Created/updated only by server routes using the service role.
alter table enquiries enable row level security;
create policy "enquiry staff read" on enquiries for select using (has_role('{owner,enquiry_manager}'));
create policy "enquiry staff update" on enquiries for update using (has_role('{owner,enquiry_manager}')) with check (has_role('{owner,enquiry_manager}'));
create policy "owner delete enquiries" on enquiries for delete using (has_role('{owner}'));

alter table enquiry_notes enable row level security;
create policy "enquiry staff notes" on enquiry_notes for all using (has_role('{owner,enquiry_manager}')) with check (has_role('{owner,enquiry_manager}'));

-- analytics: anyone may insert (consent-gated client side), only staff read
alter table analytics_events enable row level security;
create policy "anyone inserts events" on analytics_events for insert with check (true);
create policy "staff read events" on analytics_events for select using (has_role('{owner,content_manager,enquiry_manager}'));

-- storage: public bucket, staff-only writes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media','media',true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;
create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "content write media" on storage.objects for insert with check (bucket_id = 'media' and has_role('{owner,content_manager}'));
create policy "content update media" on storage.objects for update using (bucket_id = 'media' and has_role('{owner,content_manager}'));
create policy "content delete media" on storage.objects for delete using (bucket_id = 'media' and has_role('{owner,content_manager}'));

-- seed the five collections
insert into collections (slug,title,sort_order) values
 ('tunics','Tunics',1),('mens-suits','Men''s Suits',2),('weddings','Weddings',3),
 ('lady-suits','Lady Suits',4),('dresses','Dresses',5);
