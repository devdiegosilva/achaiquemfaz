-- Schema inicial do Ache Fornecedores (Supabase / Postgres)

create table if not exists fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null,
  bairro text not null,
  cidade text not null default 'João Pessoa',
  whatsapp text not null,
  email text,
  cpf_cnpj text,
  status text not null default 'inativo' check (status in ('ativo', 'inativo', 'trial')),
  asaas_customer_id text,
  asaas_checkout_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_fornecedores_categoria on fornecedores (categoria);
create index if not exists idx_fornecedores_status on fornecedores (status);

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
