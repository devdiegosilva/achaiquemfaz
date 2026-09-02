-- Migração: verificação manual do telefone do profissional (opção 1).
-- Rodar uma vez no SQL editor do Supabase. Idempotente.

alter table fornecedores
  add column if not exists telefone_verificado boolean not null default false;
