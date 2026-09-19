-- ═══════════════════════════════════════════════════════════════════
-- Journal: publicaciones editoriales del sitio
--
-- Sustituye a `posts` y `news` como fuente del feed. Esas tablas no se
-- tocan (siguen ahí con sus datos y políticas), pero el sitio nuevo ya
-- no las lee.
--
-- Mismo modelo de permisos que el resto del esquema: lectura pública
-- de lo publicado, escritura solo para el admin (por email en el JWT).
-- La moderación del servidor (`reject_profanity`) también se aplica.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.journal_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique
                check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title         text not null check (length(title) between 1 and 200),
  type          text not null default 'note'
                check (type in ('project_update','devlog','announcement','tutorial',
                                'release','note','news','stream','community')),
  excerpt       text,
  content       text not null default '',
  cover_image   text,
  published_at  timestamptz,
  tags          text[] not null default '{}',
  -- Slug del proyecto en el sitio (p. ej. 'rpgroll'), no id de GitHub:
  -- así el enlace sobrevive aunque el repo cambie de nombre.
  project       text,
  featured      boolean not null default false,
  status        text not null default 'draft'
                check (status in ('draft','published','archived')),
  author        text not null default 'Sack',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Publicado sin fecha no tiene sentido en un feed ordenado por fecha.
  check (status <> 'published' or published_at is not null)
);

create index if not exists idx_journal_published
  on public.journal_posts (published_at desc)
  where status = 'published';
create index if not exists idx_journal_project on public.journal_posts (project);

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists journal_posts_touch on public.journal_posts;
create trigger journal_posts_touch
  before update on public.journal_posts
  for each row execute function public.touch_updated_at();

-- Moderación en servidor, reutilizando la función de 20260830.
drop trigger if exists journal_posts_profanity on public.journal_posts;
create trigger journal_posts_profanity
  before insert or update on public.journal_posts
  for each row execute function public.reject_profanity('title', 'excerpt', 'content');

-- ── RLS ────────────────────────────────────────────────────────────
alter table public.journal_posts enable row level security;

drop policy if exists journal_public_read on public.journal_posts;
create policy journal_public_read on public.journal_posts
  for select using (status = 'published' and published_at <= now());

drop policy if exists journal_admin_all on public.journal_posts;
create policy journal_admin_all on public.journal_posts
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'johanjafet4@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'johanjafet4@gmail.com');

notify pgrst, 'reload schema';
