# Achaí Quem Faz

Agente que conecta demandantes e prestadores de serviço via WhatsApp, começando em João Pessoa/PB.

## Status atual (atualizado em 2026-08-31)

**No ar e testado ponta a ponta:**
- WhatsApp conectado (Evolution API, hospedada na Railway) → backend (Railway) → classificação da demanda via Claude → busca de fornecedor no Supabase → notificação ao fornecedor e confirmação ao demandante.
- Domínio próprio no ar: **www.achaiquemfaz.com.br** (o domínio sem `www` ainda não está configurado — ver "Ainda não construído").
- Cadastro de fornecedor completo: formulário `/cadastro` → checkout de assinatura na Asaas em **produção** (somente cartão de crédito — Pix não é permitido pela Asaas em cobranças recorrentes, R$ 97,90/mês) → pagamento confirmado → webhook ativa o fornecedor automaticamente no Supabase.
- Desativação automática via webhook quando uma cobrança vence sem pagamento.
- Status `trial`: fornecedores cadastrados manualmente (indicação) recebem demandas de graça por 30 dias, com uma chamada para conhecer os planos na mensagem que recebem. Base inicial de 147 fornecedores importada via planilha.
- Categorias de serviço abertas: lista base de ~38 categorias + opção "Outro" no cadastro; a IA casa a demanda do cliente com as categorias realmente cadastradas (base + personalizadas).
- Página inicial (`/`) funciona como um hub: separa quem precisa de um serviço (vai direto pro WhatsApp) de quem quer virar fornecedor (vai pra `/fornecedores`).
- Memória de conversa por demandante (tabela `demandantes`): o diálogo completo (mensagens do cliente **e** respostas da IA) fica salvo enquanto a demanda estiver em aberto, válido por até 72h. Some assim que a demanda é resolvida.
- Proteção contra loop infinito: se a IA não conseguir entender a demanda após 3 perguntas de esclarecimento seguidas, desiste e zera o contexto — evita ficar preso trocando mensagens com robôs automáticos de outros números (já aconteceu com o menu de atendimento de um fornecedor).
- Envio de notificações aos fornecedores espaçado (2-4s entre mensagens) para reduzir risco de bloqueio de conta no WhatsApp.
- Rastreamento de acessos via Google Analytics (GA4) em todas as páginas.

**Marca e visual:** o produto se chama **Achaí Quem Faz** (antigo "Ache Fornecedores", renomeado em 2026-08-22). Landing page e `/cadastro` usam uma identidade visual de "ordem de serviço" (papel, picote, linhas de corte, botões estilo carimbo), servida por `services/html.ts` (`paginaTicket`), na paleta **creme/verde-floresta/coral** — fixa, não muda com o tema escuro do sistema.

**Risco conhecido do WhatsApp (Evolution API):** por já não ser a API oficial, o número já foi banido uma vez pela Meta após uso automatizado, e o número atual segue apresentando instabilidade (quedas de conexão, erros de entrega intermitentes). **Migração para a API oficial do WhatsApp Business (Meta Cloud API) está em andamento** — o cadastro como desenvolvedor na Meta ainda está em processo de aprovação.

**Decisão de gateway de pagamento:** usando **Asaas** agora (conta pessoa física, CPF) porque a Pagar.me/Stone exige CNPJ no cadastro principal. Plano é migrar para **Pagar.me** assim que o usuário abrir CNPJ — a integração já foi pesquisada e documentada para quando isso acontecer.

**Ainda não construído:**
- Painel de gestão para o fornecedor.
- Domínio sem `www` (`achaiquemfaz.com.br`) — CNAME na raiz é rejeitado pelo Registro.br em modo avançado; resolver isso no modo básico exigiria remover os registros TXT de verificação da Railway, então foi adiado. Por enquanto, use sempre `www.achaiquemfaz.com.br`.
- Deduplicação de mensagens recebidas do WhatsApp (a Evolution API às vezes entrega a mesma mensagem mais de uma vez, gerando respostas repetidas) — identificado, correção ainda pendente.

## Fluxo

1. Demandante manda mensagem no WhatsApp.
2. IA (Claude) identifica a categoria do serviço; se ambíguo, faz uma pergunta curta de esclarecimento — a resposta pode chegar em uma mensagem separada, até 72h depois, sem perder o contexto (tabela `demandantes`, diálogo completo dos dois lados). Após 3 perguntas seguidas sem entender, desiste.
3. Sistema busca fornecedores disponíveis daquela categoria no Supabase (assinantes `ativo` e cadastros manuais em `trial`, estes últimos válidos por 30 dias).
4. Envia a demanda (nome, bairro, contato do demandante) para os fornecedores compatíveis.
5. Confirma ao demandante quais empresas foram avisadas.

Cadastro e ativação de fornecedores acontecem em `/cadastro` (formulário + checkout de assinatura via Asaas), com webhook de pagamento confirmando o registro na tabela `fornecedores`.

**Status do fornecedor**: `inativo` (cadastrado, aguardando pagamento) → `ativo` (assinatura paga, automático via webhook `PAYMENT_CONFIRMED`) → volta a `inativo` se a assinatura vencer sem pagamento (webhook `PAYMENT_OVERDUE`). Existe também `trial`: fornecedores inseridos manualmente no Supabase (via indicação, sem passar pelo `/cadastro`) recebem demandas de graça por 30 dias a partir da data do cadastro (`created_at`) — a mensagem que eles recebem inclui um convite para conhecer os planos. Passados os 30 dias, o fornecedor para de aparecer nas buscas automaticamente (sem precisar de nenhuma rotina/job — é calculado na hora da consulta).

## Stack

- **Backend**: Node.js + TypeScript + Express
- **Banco**: Supabase (Postgres)
- **IA**: Claude (Anthropic API)
- **WhatsApp**: Evolution API (self-hosted) — migração para WhatsApp Cloud API oficial em andamento (número não-oficial já sofreu bloqueio pela Meta uma vez)
- **Pagamento**: Asaas (assinatura mensal do fornecedor via checkout hospedado) — plano é migrar para Pagar.me assim que houver CNPJ

## Estrutura

```
src/
  config/env.ts          # carregamento e validação de variáveis de ambiente
  services/
    ai.ts                 # classificação da demanda via Claude
    whatsapp.ts            # envio de mensagens via Evolution API
    supabase.ts            # consultas e gravações no banco
    mensagens.ts            # variações de texto enviadas aos fornecedores
    asaas.ts                # criação de checkout de assinatura via Asaas
    html.ts                 # templates de página (paginaTicket = identidade "ordem de serviço")
  routes/
    webhook.ts             # recebe mensagens do WhatsApp e orquestra o fluxo
    inicio.ts               # página inicial (/) — escolha entre demandante e fornecedor
    landing.ts              # landing page de apresentação para fornecedores (/fornecedores)
    cadastro.ts             # formulário de cadastro de fornecedor + checkout
    webhookPagamento.ts      # confirma pagamento e ativa o fornecedor
  types/index.ts          # tipos e lista base de categorias de serviço (aberta a "outro")
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

- Concluir migração Evolution API → WhatsApp Cloud API oficial (cadastro de desenvolvedor na Meta em andamento).
- Deduplicar mensagens recebidas do webhook do WhatsApp (Evolution API às vezes entrega a mesma mensagem mais de uma vez).
- Painel simples para o fornecedor gerenciar status (ativo/inativo) e ver demandas recebidas.
- Resolver o domínio sem `www` (`achaiquemfaz.com.br`), hoje sem registro DNS.
- Migrar de Asaas para Pagar.me assim que o CNPJ estiver pronto.
