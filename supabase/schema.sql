-- InfluDash — schéma de base de données Supabase
-- À coller dans Supabase > SQL Editor > New query > Run

-- 1) Tables ------------------------------------------------------------

create table if not exists public.apps (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  emoji        text,
  accent_color text,
  created_at   timestamptz not null default now()
);

create table if not exists public.influencers (
  id           uuid primary key default gen_random_uuid(),
  app_id       uuid not null references public.apps(id) on delete cascade,
  name         text not null,
  handle       text,
  platform     text,
  payment_type text not null default 'rpm' check (payment_type in ('fixed','rpm')),
  rpm_given    numeric,
  fixed_cost   numeric,
  revenu       numeric,
  users        numeric,
  vues         numeric,
  nb_clients   numeric,
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists influencers_app_id_idx on public.influencers(app_id);

create table if not exists public.settings (
  id            int primary key default 1,
  theme_mode    text default 'dark',
  preset        text default 'rose',
  custom_accent text,
  updated_at    timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- 2) Row Level Security ------------------------------------------------
-- Un seul compte partagé : tout utilisateur authentifié a accès complet.

alter table public.apps        enable row level security;
alter table public.influencers enable row level security;
alter table public.settings    enable row level security;

drop policy if exists "auth full apps"        on public.apps;
drop policy if exists "auth full influencers" on public.influencers;
drop policy if exists "auth full settings"    on public.settings;

create policy "auth full apps"
  on public.apps        for all to authenticated using (true) with check (true);
create policy "auth full influencers"
  on public.influencers for all to authenticated using (true) with check (true);
create policy "auth full settings"
  on public.settings    for all to authenticated using (true) with check (true);

-- 3) Realtime ----------------------------------------------------------

alter publication supabase_realtime add table public.apps;
alter publication supabase_realtime add table public.influencers;
alter publication supabase_realtime add table public.settings;
