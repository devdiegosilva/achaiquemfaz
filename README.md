# Ache Fornecedores

Agente que conecta demandantes e prestadores de serviço via WhatsApp, começando em João Pessoa/PB.

## Fluxo

1. Demandante manda mensagem no WhatsApp.
2. IA (Claude) identifica a categoria do serviço; se ambíguo, faz uma pergunta curta de esclarecimento.
3. Sistema busca fornecedores ativos daquela categoria no Supabase.
4. Envia a demanda (nome, bairro, contato do demandante) para os fornecedores compatíveis.
5. Confirma ao demandante quais empresas foram avisadas.

Cadastro e ativação de fornecedores acontecem por uma landing page separada (fora deste repositório por enquanto), com pagamento de assinatura confirmando o registro na tabela `fornecedores`.

## Stack

- **Backend**: Node.js + TypeScript + Express
- **Banco**: Supabase (Postgres)
- **IA**: Claude (Anthropic API)
- **WhatsApp**: Evolution API (self-hosted) — trocar por WhatsApp Cloud API oficial quando precisar de mais confiabilidade/escala

## Estrutura

```
src/
  config/env.ts        # carregamento e validação de variáveis de ambiente
  services/
    ai.ts               # classificação da demanda via Claude
    whatsapp.ts          # envio de mensagens via Evolution API
    supabase.ts          # consultas e gravações no banco
    conversationState.ts # estado em memória para perguntas de esclarecimento
  routes/webhook.ts     # recebe mensagens do WhatsApp e orquestra o fluxo
  types/index.ts        # tipos e lista de categorias de serviço
db/schema.sql           # schema das tabelas (fornecedores, demandas, demandas_notificacoes)
```

## Setup local

1. Copie `.env.example` para `.env` e preencha as chaves (Supabase, Anthropic, Evolution API).
2. Crie um projeto no Supabase e rode o `db/schema.sql` no SQL editor.
3. Suba uma instância da Evolution API (Docker) e configure o webhook dela para apontar para `POST /webhook/whatsapp` deste backend.
4. Instale as dependências e rode:

```bash
npm install
npm run dev
```

## Próximos passos sugeridos

- Landing page de cadastro de fornecedores + checkout de assinatura (Stripe/Asaas), com webhook de pagamento ativando o registro em `fornecedores`.
- Painel simples para o fornecedor gerenciar status (ativo/inativo) e ver demandas recebidas.
- Migrar Evolution API → WhatsApp Cloud API oficial quando o volume justificar.
