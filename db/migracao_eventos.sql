-- Migração: analytics próprio do diretório (tabela eventos).
-- Rodar uma vez no SQL editor do Supabase. Idempotente.

create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  tipo text not null check (tipo in ('busca', 'perfil_visto', 'whatsapp_clicado')),
  servico text,
  bairro text,
  profissional_slug text,
  resultados_count int,                                  -- só para tipo = 'busca'
  contexto text check (contexto in ('card_busca', 'perfil') or contexto is null),
  session_id text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  user_agent text,
  interno boolean not null default false
);

create index if not exists idx_eventos_tipo_criado on eventos (tipo, criado_em);
create index if not exists idx_eventos_slug on eventos (profissional_slug);
