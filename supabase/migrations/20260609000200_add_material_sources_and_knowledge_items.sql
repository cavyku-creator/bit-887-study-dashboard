create table if not exists public.material_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_kind text not null check (source_kind in ('manual', 'screenshot', 'pdf', 'ocr_text', 'url', 'note')),
  subject text not null check (subject in ('english', 'professional_887', 'general')),
  title text not null,
  source_label text,
  source_url text,
  storage_bucket text,
  storage_path text,
  file_mime_type text,
  file_size_bytes bigint,
  ocr_status text not null default 'pending' check (ocr_status in ('pending', 'done', 'failed', 'not_needed')),
  ocr_text text,
  copyright_scope text not null default 'private_notes_only' check (copyright_scope in ('private_notes_only', 'personal_copy', 'unknown')),
  is_private boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subject text not null check (subject in ('english', 'professional_887', 'general')),
  module text not null,
  topic text,
  title text not null,
  slug text,
  summary text,
  content_md text not null,
  tags text[] not null default '{}',
  difficulty smallint not null default 3 check (difficulty between 1 and 5),
  review_state text not null default 'new' check (review_state in ('new', 'learning', 'stable', 'needs_revision')),
  latest_source_id uuid references public.material_sources(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.knowledge_item_sources (
  knowledge_item_id uuid not null references public.knowledge_items(id) on delete cascade,
  material_source_id uuid not null references public.material_sources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (knowledge_item_id, material_source_id)
);

create index if not exists material_sources_user_subject_idx
  on public.material_sources(user_id, subject, created_at desc);

create index if not exists material_sources_user_ocr_idx
  on public.material_sources(user_id, ocr_status, created_at desc);

create index if not exists knowledge_items_user_subject_module_idx
  on public.knowledge_items(user_id, subject, module, created_at desc);

create index if not exists knowledge_items_tags_gin_idx
  on public.knowledge_items using gin(tags);

drop trigger if exists set_material_sources_updated_at on public.material_sources;
create trigger set_material_sources_updated_at
before update on public.material_sources
for each row execute function public.set_updated_at();

drop trigger if exists set_knowledge_items_updated_at on public.knowledge_items;
create trigger set_knowledge_items_updated_at
before update on public.knowledge_items
for each row execute function public.set_updated_at();

alter table public.material_sources enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.knowledge_item_sources enable row level security;

grant select, insert, update, delete on public.material_sources to authenticated;
grant select, insert, update, delete on public.knowledge_items to authenticated;
grant select, insert, update, delete on public.knowledge_item_sources to authenticated;

drop policy if exists "material_sources_select_own" on public.material_sources;
drop policy if exists "material_sources_insert_own" on public.material_sources;
drop policy if exists "material_sources_update_own" on public.material_sources;
drop policy if exists "material_sources_delete_own" on public.material_sources;

create policy "material_sources_select_own"
on public.material_sources for select to authenticated
using ((select auth.uid()) = user_id);

create policy "material_sources_insert_own"
on public.material_sources for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "material_sources_update_own"
on public.material_sources for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "material_sources_delete_own"
on public.material_sources for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "knowledge_items_select_own" on public.knowledge_items;
drop policy if exists "knowledge_items_insert_own" on public.knowledge_items;
drop policy if exists "knowledge_items_update_own" on public.knowledge_items;
drop policy if exists "knowledge_items_delete_own" on public.knowledge_items;

create policy "knowledge_items_select_own"
on public.knowledge_items for select to authenticated
using ((select auth.uid()) = user_id);

create policy "knowledge_items_insert_own"
on public.knowledge_items for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "knowledge_items_update_own"
on public.knowledge_items for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "knowledge_items_delete_own"
on public.knowledge_items for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "knowledge_item_sources_select_own" on public.knowledge_item_sources;
drop policy if exists "knowledge_item_sources_insert_own" on public.knowledge_item_sources;
drop policy if exists "knowledge_item_sources_update_own" on public.knowledge_item_sources;
drop policy if exists "knowledge_item_sources_delete_own" on public.knowledge_item_sources;

create policy "knowledge_item_sources_select_own"
on public.knowledge_item_sources for select to authenticated
using ((select auth.uid()) = user_id);

create policy "knowledge_item_sources_insert_own"
on public.knowledge_item_sources for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "knowledge_item_sources_update_own"
on public.knowledge_item_sources for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "knowledge_item_sources_delete_own"
on public.knowledge_item_sources for delete to authenticated
using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'study-materials-private',
  'study-materials-private',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "study_materials_private_select_own" on storage.objects;
drop policy if exists "study_materials_private_insert_own" on storage.objects;
drop policy if exists "study_materials_private_update_own" on storage.objects;
drop policy if exists "study_materials_private_delete_own" on storage.objects;

create policy "study_materials_private_select_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'study-materials-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "study_materials_private_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'study-materials-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "study_materials_private_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'study-materials-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'study-materials-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "study_materials_private_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'study-materials-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
