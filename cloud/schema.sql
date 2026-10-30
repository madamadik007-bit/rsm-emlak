-- RSM-EMLAK cloud database (Supabase/Postgres)
-- Run only in a NEW, empty Supabase project after reviewing this file.
-- Every row belongs to its signed-in owner. No DELETE policies are created.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  full_name text not null,
  national_id text,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  property_type text,
  address text,
  province text,
  district text,
  block_no text,
  parcel_no text,
  independent_section text,
  owner_person_id uuid references public.people(id) on delete restrict,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  contract_type text not null,
  title text,
  property_id uuid references public.properties(id) on delete restrict,
  lessor_person_id uuid references public.people(id) on delete restrict,
  tenant_person_id uuid references public.people(id) on delete restrict,
  guarantor_person_id uuid references public.people(id) on delete restrict,
  signing_date date,
  rent_start_date date,
  end_date date,
  eviction_undertaking_date date,
  monthly_rent numeric(14,2),
  deposit_amount numeric(14,2),
  status text not null default 'draft',
  document_data jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists people_user_id_idx on public.people(user_id);
create index if not exists properties_user_id_idx on public.properties(user_id);
create index if not exists contracts_user_id_idx on public.contracts(user_id);
create index if not exists contracts_property_id_idx on public.contracts(property_id);

do $$
declare t text;
begin
  foreach t in array array['people','properties','contracts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "owner reads own %I" on public.%I', t, t);
    execute format('drop policy if exists "owner inserts own %I" on public.%I', t, t);
    execute format('drop policy if exists "owner updates own %I" on public.%I', t, t);
    execute format('create policy "owner reads own %I" on public.%I for select to authenticated using (user_id = auth.uid())', t, t);
    execute format('create policy "owner inserts own %I" on public.%I for insert to authenticated with check (user_id = auth.uid())', t, t);
    execute format('create policy "owner updates own %I" on public.%I for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t, t);
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

grant select, insert, update on public.people, public.properties, public.contracts to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Important: no DELETE permissions or policies are granted. Records are protected from
-- accidental deletion. Database backups should still be exported regularly by the user.
