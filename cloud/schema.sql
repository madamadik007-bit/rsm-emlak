-- RSM-EMLAK cloud database (Supabase/Postgres)
-- Run in a NEW, empty Supabase project. Each signed-in user sees only their own rows.
-- No delete permission or delete policy is granted.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  full_name text not null,
  national_id text, phone text, email text, address text, notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null, property_type text, address text, province text, district text,
  block_no text, parcel_no text, independent_section text,
  owner_person_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint properties_owner_same_user
    foreign key (owner_person_id, user_id) references public.people(id, user_id) on delete restrict
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  contract_type text not null, title text,
  property_id uuid, lessor_person_id uuid, tenant_person_id uuid, guarantor_person_id uuid,
  signing_date date, rent_start_date date, end_date date, eviction_undertaking_date date,
  monthly_rent numeric(14,2), deposit_amount numeric(14,2),
  status text not null default 'draft',
  document_data jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contracts_property_same_user
    foreign key (property_id, user_id) references public.properties(id, user_id) on delete restrict,
  constraint contracts_lessor_same_user
    foreign key (lessor_person_id, user_id) references public.people(id, user_id) on delete restrict,
  constraint contracts_tenant_same_user
    foreign key (tenant_person_id, user_id) references public.people(id, user_id) on delete restrict,
  constraint contracts_guarantor_same_user
    foreign key (guarantor_person_id, user_id) references public.people(id, user_id) on delete restrict
);

create index people_user_id_idx on public.people(user_id);
create index properties_user_id_idx on public.properties(user_id);
create index contracts_user_id_idx on public.contracts(user_id);

do $$
declare t text;
begin
  foreach t in array array['people','properties','contracts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated, public', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
    execute format('drop policy if exists owner_select on public.%I', t);
    execute format('drop policy if exists owner_insert on public.%I', t);
    execute format('drop policy if exists owner_update on public.%I', t);
    execute format('create policy owner_select on public.%I for select to authenticated using (user_id = auth.uid())', t);
    execute format('create policy owner_insert on public.%I for insert to authenticated with check (user_id = auth.uid())', t);
    execute format('create policy owner_update on public.%I for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
