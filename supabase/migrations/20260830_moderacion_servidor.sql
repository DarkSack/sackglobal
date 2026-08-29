-- ═══════════════════════════════════════════════════════════════════
-- Moderación en el servidor
--
-- Hasta ahora el filtro de palabras obscenas vivía solo en el cliente
-- (src/lib/profanity.ts). Eso avisa al usuario, pero no impide nada: la
-- clave `anon` es pública, así que cualquiera puede hacer un INSERT
-- directo contra PostgREST y saltárselo por completo.
--
-- Esta migración mueve la barrera a la base de datos, que es el único
-- sitio donde no se puede rodear. El filtro del cliente se queda como
-- aviso inmediato; este es el que manda.
--
-- Se aplica a: posts.content, post_comments.content, news.title,
-- news.notice y repo_interactions.content.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1) Diccionario en tabla, no en la función ────────────────────
-- Así se amplía sin necesidad de una migración nueva cada vez que
-- aparece una palabra que se coló.
create table if not exists public.blocked_words (
  word       text primary key,
  lang       text not null default 'es' check (lang in ('es', 'en')),
  created_at timestamptz not null default now()
);

alter table public.blocked_words enable row level security;

-- Lectura pública: la lista no es secreta (el cliente ya la lleva
-- empaquetada) y así podría cargarse desde el navegador en el futuro.
drop policy if exists blocked_words_read on public.blocked_words;
create policy blocked_words_read on public.blocked_words
  for select using (true);

drop policy if exists blocked_words_admin_all on public.blocked_words;
create policy blocked_words_admin_all on public.blocked_words
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'johanjafet4@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'johanjafet4@gmail.com');

-- ── 2) Normalización ─────────────────────────────────────────────
-- Réplica exacta de la del cliente: minúsculas, sin tildes y
-- deshaciendo el leetspeak (@=a, 3=e, 1=i, 0=o, 5/$=s, 7=t).
--
-- IMPORTANTE: la eñe NO se convierte en ene, a diferencia de lo que
-- hacía la versión anterior. Al hacerlo, "coño" se normalizaba a
-- "cono" y bloqueaba la palabra "cono" (la figura geométrica, el del
-- helado). En español la eñe es una letra distinta, no una ene con
-- adorno, y tratarla como tal elimina el falso positivo.
create or replace function public.normalize_text(t text)
returns text
language sql
immutable
as $$
  select translate(
           translate(
             lower(coalesce(t, '')),
             'áàäâãéèëêíìïîóòöôõúùüûç',
             'aaaaaeeeeiiiiooooouuuuc'
           ),
           '@43€1!05$7',
           'aaeeiioost'
         );
$$;

-- ── 3) Detección ─────────────────────────────────────────────────
-- Se normaliza el texto entero y se parte en tokens. Los tokens de
-- menos de 3 letras se ignoran: son la fuente principal de falsos
-- positivos y ninguna palabra de la lista los necesita.
create or replace function public.find_profanity(t text)
returns text[]
language sql
stable
as $$
  select coalesce(array_agg(distinct tok), '{}'::text[])
  from (
    select unnest(
      regexp_split_to_array(public.normalize_text(t), '[^a-z0-9ñ]+')
    ) as tok
  ) tokens
  where length(tok) >= 3
    and exists (select 1 from public.blocked_words b where b.word = tok);
$$;

create or replace function public.has_profanity(t text)
returns boolean
language sql
stable
as $$
  select array_length(public.find_profanity(t), 1) is not null;
$$;

-- ── 4) Trigger genérico ──────────────────────────────────────────
-- Recibe como argumentos los nombres de columna a revisar, de modo
-- que la misma función sirve para las cinco columnas.
create or replace function public.reject_profanity()
returns trigger
language plpgsql
as $$
declare
  col   text;
  val   text;
  found text[];
begin
  foreach col in array tg_argv loop
    -- to_jsonb + ->> permite leer una columna cuyo nombre solo se
    -- conoce en tiempo de ejecución.
    val := to_jsonb(new) ->> col;
    if val is null then
      continue;
    end if;

    found := public.find_profanity(val);
    if array_length(found, 1) is not null then
      raise exception
        'Ese texto contiene lenguaje no permitido (%): %',
        col, array_to_string(found, ', ')
        using errcode = 'check_violation',
              hint = 'Reescribe el mensaje sin esas palabras.';
    end if;
  end loop;

  return new;
end;
$$;

-- ── 5) Enganche en cada tabla con texto libre ────────────────────
drop trigger if exists posts_no_profanity on public.posts;
create trigger posts_no_profanity
  before insert or update on public.posts
  for each row execute function public.reject_profanity('content');

drop trigger if exists post_comments_no_profanity on public.post_comments;
create trigger post_comments_no_profanity
  before insert or update on public.post_comments
  for each row execute function public.reject_profanity('content');

drop trigger if exists news_no_profanity on public.news;
create trigger news_no_profanity
  before insert or update on public.news
  for each row execute function public.reject_profanity('title', 'notice');

drop trigger if exists repo_interactions_no_profanity on public.repo_interactions;
create trigger repo_interactions_no_profanity
  before insert or update on public.repo_interactions
  for each row execute function public.reject_profanity('content');

-- ── 6) Diccionario inicial ───────────────────────────────────────
-- Las palabras se guardan ya normalizadas (sin tildes, en minúsculas),
-- que es la forma con la que se compara. La eñe sí se conserva.
insert into public.blocked_words (word, lang) values
  -- Español
  ('puta','es'), ('putas','es'), ('puto','es'), ('putos','es'),
  ('putazo','es'), ('putona','es'), ('puton','es'), ('putones','es'),
  ('pendejo','es'), ('pendejos','es'), ('pendeja','es'), ('pendejas','es'),
  ('pendejada','es'), ('pendejadas','es'),
  ('cabron','es'), ('cabrones','es'), ('cabrona','es'), ('cabronazo','es'),
  ('mierda','es'), ('mierdas','es'), ('mierdero','es'),
  ('verga','es'), ('vergas','es'), ('vergazo','es'),
  ('chinga','es'), ('chingar','es'), ('chingada','es'), ('chingadas','es'),
  ('chingado','es'), ('chingados','es'), ('chingon','es'), ('chingona','es'),
  ('coño','es'), ('coños','es'), ('coñazo','es'),
  ('joder','es'), ('jodido','es'), ('jodida','es'), ('jodete','es'),
  ('gilipollas','es'), ('gilipuertas','es'),
  ('mamon','es'), ('mamones','es'), ('mamona','es'), ('mamonazo','es'),
  ('polla','es'), ('pollas','es'), ('pollazo','es'),
  ('cojones','es'), ('cojonudo','es'), ('cojonuda','es'),
  ('carajo','es'), ('carajos','es'),
  ('culero','es'), ('culera','es'), ('culeros','es'),
  ('marica','es'), ('maricas','es'), ('maricon','es'), ('maricones','es'),
  ('mariconada','es'),
  ('follar','es'), ('follada','es'), ('follado','es'),
  ('hijueputa','es'), ('hijoputa','es'), ('hijaputa','es'),
  ('hijodeputa','es'), ('hijadeputa','es'),
  ('negrata','es'), ('negrero','es'), ('sudaca','es'), ('gitanada','es'),
  ('moraco','es'), ('retrasado','es'), ('retrasada','es'), ('subnormal','es'),
  ('mongolo','es'), ('mongola','es'),
  -- Inglés
  ('fuck','en'), ('fucked','en'), ('fucker','en'), ('fuckers','en'),
  ('fucking','en'), ('fucks','en'), ('fck','en'),
  ('shit','en'), ('shitty','en'), ('bullshit','en'),
  ('bitch','en'), ('bitches','en'), ('bitchy','en'),
  ('asshole','en'), ('assholes','en'),
  ('cunt','en'), ('cunts','en'),
  ('dickhead','en'),
  ('cocksucker','en'),
  ('pussies','en'),
  ('bastard','en'), ('bastards','en'),
  ('motherfucker','en'), ('motherfuckers','en'),
  ('twat','en'), ('twats','en'),
  ('wanker','en'), ('wankers','en'),
  ('slut','en'), ('sluts','en'), ('slutty','en'),
  ('whore','en'), ('whores','en'),
  ('faggot','en'), ('faggots','en'),
  ('retard','en'), ('retarded','en'), ('retards','en'),
  ('nigger','en'), ('niggers','en'), ('nigga','en'), ('niggas','en')
on conflict (word) do nothing;

-- ═══════════════════════════════════════════════════════════════════
-- Palabras retiradas respecto a la lista del cliente, y por qué
--
--   coger        En España es un verbo corriente ("coger el autobús").
--                Bloquearlo rompe frases normales.
--   cono/conos   Eran la normalización de "coño"; ahora esa entrada va
--                con eñe, así que la figura geométrica deja de saltar.
--   dick/dicks   Es también un nombre propio (Dick) y aparece dentro de
--                términos técnicos. Queda "dickhead", que no es ambiguo.
--   cock/cocks   Colisiona con gallo, y con "cockpit" o "cocktail" si
--                algún día se relaja el match por token.
--   pussy        Colisiona con el uso literal (gato). Queda "pussies".
--   fag/fags     Tres letras y colisión con "fag" británico coloquial;
--                queda "faggot", que es inequívoco.
--   mf/mfs       Menos de 3 caracteres, el umbral ya los descartaba.
--
-- Para volver a añadir cualquiera de ellas basta un INSERT en
-- public.blocked_words; no hace falta tocar código ni desplegar.
-- ═══════════════════════════════════════════════════════════════════
