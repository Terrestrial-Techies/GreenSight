-- Run this in Supabase SQL Editor
-- Purpose: enable Community posts (message + optional image) to save to `reviews`

create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  park_id bigint not null references public.parks(id) on delete cascade,
  user_id uuid not null,
  review_text text not null,
  image_url text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_park_id on public.reviews(park_id);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);

-- Storage bucket for uploaded review images
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do nothing;

-- Storage policies (for authenticated users)
drop policy if exists "review-images read public" on storage.objects;
create policy "review-images read public"
on storage.objects
for select
to public
using (bucket_id = 'review-images');

drop policy if exists "review-images insert authenticated" on storage.objects;
create policy "review-images insert authenticated"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'review-images');

drop policy if exists "review-images update owner" on storage.objects;
create policy "review-images update owner"
on storage.objects
for update
to authenticated
using (bucket_id = 'review-images' and owner = auth.uid())
with check (bucket_id = 'review-images' and owner = auth.uid());

drop policy if exists "review-images delete owner" on storage.objects;
create policy "review-images delete owner"
on storage.objects
for delete
to authenticated
using (bucket_id = 'review-images' and owner = auth.uid());
