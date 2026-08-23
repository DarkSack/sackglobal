-- ═══════════════════════════════════════════════════════════════════
-- Posts: solo admin publica  +  post_comments: cualquier logueado
-- ═══════════════════════════════════════════════════════════════════

-- Posts: reemplazar policies para restringir a admin
drop policy if exists posts_owner_insert on public.posts;
drop policy if exists posts_owner_update on public.posts;
drop policy if exists posts_owner_delete on public.posts;

create policy posts_admin_insert on public.posts
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'johanjafet4@gmail.com');

create policy posts_admin_update on public.posts
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'johanjafet4@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'johanjafet4@gmail.com');

create policy posts_admin_delete on public.posts
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'johanjafet4@gmail.com');

-- Nueva tabla: comentarios en posts (moderacion abierta a autores + admin)
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_post_comments_post_id on public.post_comments(post_id);
create index if not exists idx_post_comments_user_id on public.post_comments(user_id);
create index if not exists idx_post_comments_created_at on public.post_comments(created_at desc);

alter table public.post_comments enable row level security;

drop policy if exists post_comments_read on public.post_comments;
create policy post_comments_read on public.post_comments
  for select using (true);

drop policy if exists post_comments_auth_insert on public.post_comments;
create policy post_comments_auth_insert on public.post_comments
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists post_comments_own_delete on public.post_comments;
create policy post_comments_own_delete on public.post_comments
  for delete to authenticated
  using (auth.uid() = user_id);

-- Admin puede borrar cualquier comentario (moderacion)
drop policy if exists post_comments_admin_delete on public.post_comments;
create policy post_comments_admin_delete on public.post_comments
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'johanjafet4@gmail.com');
