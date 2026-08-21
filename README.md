# Ache Fornecedores

Agente que conecta demandantes e prestadores de serviço via WhatsApp, começando em João Pessoa/PB.

## Status atual (atualizado em 2026-08-16)

**No ar e testado ponta a ponta:**
- WhatsApp conectado (Evolution API, hospedada na Railway) → backend (Railway) → classificação da demanda via Claude → busca de fornecedor no Supabase → notificação ao fornecedor e confirmação ao demandante. Teste real feito com sucesso em 2026-08-16.

**Construído, aguardando configuração final do usuário (não testado ainda):**
- Landing page de cadastro de fornecedor em `/cadastro` com checkout de assinatura recorrente (Asaas, Pix + cartão de crédito, R$ 97,90/mês).
- Webhook de pagamento (`/webhook/pagamento`) que ativa o fornecedor quando o pagamento é confirmado e desativa automaticamente se uma cobrança vencer sem pagamento.
- Status `trial`: fornecedores cadastrados manualmente (indicação) recebem demandas de graça por 30 dias, com uma chamada para conhecer os planos na mensagem que recebem.
- Pendências para ativar isso em produção: rodar migração SQL no Supabase, configurar 5 variáveis de ambiente novas na Railway, e configurar o webhook no painel do Asaas.

**Decisão de gateway de pagamento:** usando **Asaas** agora (conta pessoa física, CPF) porque a Pagar.me/Stone exige CNPJ no cadastro principal. Plano é migrar para **Pagar.me** assim que o usuário abrir CNPJ — a integração já foi pesquisada e documentada para quando isso acontecer.

**Ainda não construído:** painel de gestão para o fornecedor, e a landing page ainda não tem domínio próprio (usa a URL do backend na Railway).

## Fluxo

1. Demandante manda mensagem no WhatsApp.
2. IA (Claude) identifica a categoria do serviço; se ambíguo, faz uma pergunta curta de esclarecimento.
3. Sistema busca fornecedores disponíveis daquela categoria no Supabase (assinantes `ativo` e cadastros manuais em `trial`, estes últimos válidos por 30 dias).
4. Envia a demanda (nome, bairro, contato do demandante) para os fornecedores compatíveis.
5. Confirma ao demandante quais empresas foram avisadas.

Cadastro e ativação de fornecedores acontecem em `/cadastro` (formulário + checkout de assinatura via Asaas), com webhook de pagamento confirmando o registro na tabela `fornecedores`.

**Status do fornecedor**: `inativo` (cadastrado, aguardando pagamento) → `ativo` (assinatura paga, automático via webhook `PAYMENT_CONFIRMED`) → volta a `inativo` se a assinatura vencer sem pagamento (webhook `PAYMENT_OVERDUE`). Existe também `trial`: fornecedores inseridos manualmente no Supabase (via indicação, sem passar pelo `/cadastro`) recebem demandas de graça por 30 dias a partir da data do cadastro (`created_at`) — a mensagem que eles recebem inclui um convite para conhecer os planos. Passados os 30 dias, o fornecedor para de aparecer nas buscas automaticamente (sem precisar de nenhuma rotina/job — é calculado na hora da consulta).

## Stack

- **Backend**: Node.js + TypeScript + Express
- **Banco**: Supabase (Postgres)
- **IA**: Claude (Anthropic API)
- **WhatsApp**: Evolution API (self-hosted) — trocar por WhatsApp Cloud API oficial quando precisar de mais confiabilidade/escala
- **Pagamento**: Asaas (assinatura mensal do fornecedor via checkout hospedado) — plano é migrar para Pagar.me assim que houver CNPJ

## Estrutura

```
src/
  config/env.ts          # carregamento e validação de variáveis de ambiente
  services/
    ai.ts                 # classificação da demanda via Claude
    whatsapp.ts            # envio de mensagens via Evolution API
    supabase.ts            # consultas e gravações no banco
    conversationState.ts   # estado em memória para perguntas de esclarecimento
    mensagens.ts            # variações de texto enviadas aos fornecedores
    asaas.ts                # criação de checkout de assinatura via Asaas
  routes/
    webhook.ts             # recebe mensagens do WhatsApp e orquestra o fluxo
    cadastro.ts             # formulário de cadastro de fornecedor + checkout
    webhookPagamento.ts      # confirma pagamento e ativa o fornecedor
  types/index.ts          # tipos e lista de categorias de serviço
db/schema.sql             # schema das tabelas (fornecedores, demandas, demandas_notificacoes)
```

## Setup local

1. Copie `.env.example` para `.env` e preencha as chaves (Supabase, Anthropic, Evolution API, Asaas).
2. Crie um projeto no Supabase e rode o `db/schema.sql` no SQL editor.
3. Suba uma instância da Evolution API (Docker) e configure o webhook dela para apontar para `POST /webhook/whatsapp` deste backend.
4. Configure um webhook no Asaas apontando para `POST /webhook/pagamento`, eventos `PAYMENT_CONFIRMED` (ativa o fornecedor) e `PAYMENT_OVERDUE` (desativa o fornecedor quando a assinatura vence sem pagamento), com o mesmo token em `ASAAS_WEBHOOK_TOKEN`.
5. Instale as dependências e rode:

```bash
npm install
npm run dev
```

## Próximos passos sugeridos

- Painel simples para o fornecedor gerenciar status (ativo/inativo) e ver demandas recebidas.
- Migrar Evolution API → WhatsApp Cloud API oficial quando o volume justificar.
- Migrar de Asaas para Pagar.me assim que o CNPJ estiver pronto.
