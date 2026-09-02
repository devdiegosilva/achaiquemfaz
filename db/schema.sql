-- Schema inicial do Achaí Quem Faz (Supabase / Postgres)

create table if not exists fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null,
  -- Opcional: fornecedores importados em lote (indicação/trial) nem sempre têm bairro
  -- conhecido. Um fornecedor sem bairro ainda aparece em buscas sem filtro de bairro.
  bairro text,
  cidade text not null default 'João Pessoa',
  whatsapp text not null,
  email text,
  cpf_cnpj text,
  status text not null default 'inativo' check (status in ('ativo', 'inativo', 'trial')),
  asaas_customer_id text,
  asaas_checkout_id text,
  created_at timestamptz not null default now(),

  -- Diretório público (/diretorio) — módulo em paralelo ao fluxo do WhatsApp.
  -- Um fornecedor só aparece no diretório quando publicado = true (opt-in explícito
  -- do prestador, exigência de LGPD). É independente de status/trial: um cadastro
  -- feito pelo diretório entra como status = 'inativo' (não recebe disparo no
  -- WhatsApp) e publicado conforme a escolha dele.
  publicado boolean not null default false,
  slug text unique,
  descricao text,
  -- Serviços oferecidos, além da categoria principal (buscáveis no diretório).
  servicos text[] not null default '{}',
  -- Foco inicial do diretório: 'casa' e/ou 'condominio'.
  segmentos text[] not null default '{casa,condominio}',
  -- Magic link de edição do próprio perfil (/editar?token=...). Sem senha.
  edit_token uuid not null default gen_random_uuid(),
  -- Verificação manual: marcado no /admin quando a Achaí confirma o WhatsApp do
  -- profissional (normalmente ao conseguir falar com ele pelo número cadastrado).
  telefone_verificado boolean not null default false
);

create index if not exists idx_fornecedores_categoria on fornecedores (categoria);
create index if not exists idx_fornecedores_status on fornecedores (status);
create index if not exists idx_fornecedores_publicado on fornecedores (publicado);
create unique index if not exists idx_fornecedores_edit_token on fornecedores (edit_token);

create table if not exists demandas (
  id uuid primary key default gen_random_uuid(),
  demandante_nome text,
  demandante_whatsapp text not null,
  categoria text not null,
  bairro text,
  mensagem_original text not null,
  created_at timestamptz not null default now()
);

create table if not exists demandas_notificacoes (
  id uuid primary key default gen_random_uuid(),
  demanda_id uuid not null references demandas (id) on delete cascade,
  fornecedor_id uuid not null references fornecedores (id) on delete cascade,
  enviado_em timestamptz not null default now()
);

-- Guarda, por demandante (identificado pelo WhatsApp), uma conversa em aberto: a IA fez
-- uma pergunta de esclarecimento e está esperando resposta. Zerado assim que a demanda é
-- resolvida (fornecedor encontrado ou não). Se ninguém responder em 72h, o contexto expira
-- e a próxima mensagem é tratada como uma demanda nova (ver services/supabase.ts).
create table if not exists demandantes (
  id uuid primary key default gen_random_uuid(),
  whatsapp text not null unique,
  nome text,
  contexto_pendente text,
  atualizado_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);
