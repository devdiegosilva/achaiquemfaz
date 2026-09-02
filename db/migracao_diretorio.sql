-- Migração: módulo Diretório (/diretorio), em paralelo ao fluxo do WhatsApp.
-- Rodar uma vez no SQL editor do Supabase. Idempotente — pode rodar de novo sem efeito.
--
-- Não altera nada do fluxo atual: só adiciona colunas nullable/com default à tabela
-- fornecedores. Nenhum fornecedor passa a aparecer no diretório até publicado = true.

alter table fornecedores
  add column if not exists publicado boolean not null default false,
  add column if not exists slug text,
  add column if not exists descricao text,
  add column if not exists servicos text[] not null default '{}',
  add column if not exists segmentos text[] not null default '{casa,condominio}',
  add column if not exists edit_token uuid not null default gen_random_uuid();

create index if not exists idx_fornecedores_publicado on fornecedores (publicado);
create unique index if not exists idx_fornecedores_slug on fornecedores (slug);
create unique index if not exists idx_fornecedores_edit_token on fornecedores (edit_token);

-- Backfill de slug para os fornecedores já cadastrados (inclui os ~150 importados).
-- Base: nome "slugificado" + sufixo curto do id para garantir unicidade.
update fornecedores
set slug = trim(both '-' from regexp_replace(
      lower(translate(
        nome,
        'áàâãäéèêëíìîïóòôõöúùûüçñ',
        'aaaaaeeeeiiiiooooouuuucn'
      )),
      '[^a-z0-9]+', '-', 'g'
    )) || '-' || substr(id::text, 1, 4)
where slug is null;
