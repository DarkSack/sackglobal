-- ═══════════════════════════════════════════════════════════════════
-- Arreglo: el listado de posts devolvía 400 y nunca mostraba autor
--
-- `posts`, `post_comments` y `repo_interactions` referencian
-- `auth.users`, que PostgREST no expone. Pero las consultas del
-- cliente piden el autor así:
--
--     users:users!user_id(nickname, avatar_url)
--
-- ...apuntando a `public.users`, con la que no existía ninguna
-- relación declarada. PostgREST respondía:
--
--     PGRST200: Could not find a relationship between 'posts' and
--     'users' in the schema cache
--
-- Es decir: la página de Posts llevaba fallando desde siempre. No se
-- notaba porque el `catch` del cliente solo hacía `console.warn` y la
-- pantalla quedaba en "Aún no hay posts", que es indistinguible de no
-- tener ninguno. Salió a la luz al añadir la caché: los errores no se
-- cachean, así que la consulta se repetía en cada visita.
--
-- `public.users` ya es un espejo de `auth.users` que mantiene al día el
-- trigger `handle_new_user`, así que declarar también la clave ajena
-- contra él da la relación que faltaba sin duplicar nada.
-- ═══════════════════════════════════════════════════════════════════

alter table public.posts
  drop constraint if exists posts_user_id_users_fkey;
alter table public.posts
  add constraint posts_user_id_users_fkey
  foreign key (user_id) references public.users (user_id) on delete set null;

alter table public.post_comments
  drop constraint if exists post_comments_user_id_users_fkey;
alter table public.post_comments
  add constraint post_comments_user_id_users_fkey
  foreign key (user_id) references public.users (user_id) on delete cascade;

alter table public.repo_interactions
  drop constraint if exists repo_interactions_user_id_users_fkey;
alter table public.repo_interactions
  add constraint repo_interactions_user_id_users_fkey
  foreign key (user_id) references public.users (user_id) on delete cascade;

-- PostgREST cachea el esquema: sin esto, la relación nueva no se ve
-- hasta que el servicio se reinicia por su cuenta.
notify pgrst, 'reload schema';
