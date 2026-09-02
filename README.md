# Achaí Quem Faz

Conecta quem precisa de um serviço para casa ou condomínio a profissionais e empresas
da região, em João Pessoa/PB.

O projeto tem **duas frentes** hoje:

1. **Diretório (`/diretorio`)** — a direção atual do produto. Vitrine pública de
   profissionais no modelo marketplace; o cliente busca, abre o perfil e fala direto
   no WhatsApp do profissional. Sem bot, sem Evolution API, sem depender da Meta.
   **Pronto para piloto** (ver seção "Diretório" abaixo).
2. **Fluxo WhatsApp (`/`, `/fornecedores`, `/cadastro`, webhooks)** — o produto
   original: um agente que recebe a demanda por WhatsApp, classifica via IA e dispara
   para fornecedores. Continua no ar em paralelo; será **desligado** quando o diretório
   se provar (aí `/` passa a apontar para o diretório e a rota do webhook é removida).

O pivô (2026-09-02) foi motivado pela fragilidade dupla do fluxo WhatsApp: o número
Evolution API (não-oficial) pode ser banido sem aviso, e a verificação Meta Business
está travada em burocracia fora do controle do time.

## Status atual (atualizado em 2026-09-02)

> As seções abaixo até "Fluxo" descrevem o **fluxo WhatsApp** (produto original). O
> diretório tem seção própria mais adiante.

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

## Diretório (`/diretorio`)

Vitrine pública de profissionais no modelo marketplace (tipo GetNinjas/Triider), com
foco inicial em **casa e condomínio** em João Pessoa. O cliente busca por serviço e
bairro, abre o perfil e fala **direto** no WhatsApp do profissional (`wa.me`) — sem bot,
sem Evolution API, sem aprovação da Meta.

Roda no mesmo backend/deploy, montado em `/diretorio`, **sem tocar no fluxo do WhatsApp**.

**Visual:** design system próprio — base branca SaaS, verde `#15654a` primário, coral só
em detalhe; Bricolage Grotesque (títulos) + Work Sans (texto) + IBM Plex Mono (labels).
Servido por `paginaSite` / `CSS_SITE` em `services/html.ts`, independente da identidade
"ordem de serviço" do fluxo WhatsApp (`paginaTicket`). Tema único claro. Mobile-first.

**Rotas:**
- `GET /diretorio` — home: hero, busca "O que? / Onde?", cards de categoria, "como funciona".
- `GET /diretorio/busca` — resultados: barra de busca serviço+bairro, filtros laterais
  (Serviço / Bairro / Atende) — gaveta no celular —, ordenação, empty state com sugestões.
- `GET /diretorio/p/:slug` — perfil público (Sobre, Serviços, Área de atendimento,
  Como funciona) + caixa de contato fixa; no celular, CTA "Chamar no WhatsApp" fixo na base.
- `GET|POST /diretorio/cadastro` — auto-cadastro do profissional em **5 etapas** (Dados ·
  Serviços · Localização · Sobre · Confirmar), com barra de progresso; uma página, um POST,
  degrada para formulário único sem JS. Serviço principal tem opção "Outro" (texto livre).
  Bairro é lista fechada dos bairros de João Pessoa (`BAIRROS_JOAO_PESSOA` em `types`) +
  opção "João Pessoa — cidade toda"; quem escolhe "cidade toda" aparece em qualquer busca
  por bairro. Enquanto `DIRETORIO_EXIGE_ASSINATURA=false`, é gratuito e o perfil já entra
  publicado; a tela de sucesso mostra o **magic link** de edição para o profissional guardar.
- `GET|POST /diretorio/editar?token=…` — o profissional edita o próprio perfil e liga/
  desliga a publicação. Sem senha, só o `edit_token`.
- `GET /diretorio/admin?chave=…` — painel gated por `ADMIN_CHAVE`. Lista todos os perfis
  com o magic link e uma mensagem de convite pronta para enviar aos ~150 já cadastrados
  (opt-in de publicação — LGPD, já que eles foram importados, não se cadastraram). Toggle
  publicar/ocultar por linha.

**Banco:** a tabela `fornecedores` ganhou colunas nullable (`publicado`, `slug`,
`descricao`, `servicos text[]`, `segmentos text[]`, `edit_token uuid`). Visibilidade no
diretório = `publicado = true`, **independente** de `status`/`trial` (que seguem
controlando só o disparo no WhatsApp). Um cadastro feito pelo diretório entra como
`status = 'inativo'`. Migração `db/migracao_diretorio.sql` já rodada no Supabase em
2026-09-02 (idempotente; fez o backfill de `slug` e `edit_token` dos registros existentes).

**Ainda pendente no diretório** (nesta ordem, combinado em 2026-09-02):
1. Avaliações / estrelas (schema novo, quem pode avaliar, moderação).
2. Selo "verificado" (coluna nova + marcação manual no admin).
3. Dashboard do profissional (exige login/autenticação — não existe hoje).
4. Caminho pago: quando `DIRETORIO_EXIGE_ASSINATURA=true`, o cadastro entra despublicado
   e ainda **não há checkout** ligado.

Outros itens menores: envio automático do magic link por e-mail/WhatsApp (hoje é manual,
pelo admin); fotos de perfil (hoje é monograma de iniciais).

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
  config/env.ts             # carregamento e validação de variáveis de ambiente
  services/
    ai.ts                   # [WhatsApp] classificação da demanda via Claude
    whatsapp.ts             # [WhatsApp] envio de mensagens via Evolution API
    mensagens.ts            # [WhatsApp] variações de texto enviadas aos fornecedores
    asaas.ts                # [WhatsApp] criação de checkout de assinatura via Asaas
    supabase.ts             # consultas e gravações no banco (WhatsApp + diretório)
    html.ts                 # paginaTicket (identidade "ordem de serviço") + paginaSite/CSS_SITE (diretório)
    slug.ts                 # [diretório] gera slug de URL a partir do nome
    diretorioCampos.ts      # [diretório] CSS dos formulários + helpers (campoCategoria, campoBairro, ...)
  routes/
    webhook.ts              # [WhatsApp] recebe mensagens e orquestra o fluxo
    webhookPagamento.ts     # [WhatsApp] confirma pagamento e ativa o fornecedor
    inicio.ts               # [WhatsApp] página inicial (/) — escolha entre demandante e fornecedor
    landing.ts              # [WhatsApp] landing para fornecedores (/fornecedores)
    cadastro.ts             # [WhatsApp] formulário de cadastro de fornecedor + checkout
    diretorio.ts            # [diretório] home (/diretorio), busca (/diretorio/busca), perfil (/p/:slug)
    diretorioCadastro.ts    # [diretório] auto-cadastro em 5 etapas
    diretorioEditar.ts      # [diretório] edição de perfil via magic link
    diretorioAdmin.ts       # [diretório] painel gated por ADMIN_CHAVE
  types/index.ts            # tipos, categorias (base + casa/condomínio), lista de bairros de João Pessoa
db/
  schema.sql               # schema completo das tabelas
  migracao_diretorio.sql   # migração aditiva do módulo diretório (já aplicada em 2026-09-02)
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

## Próximos passos

**Diretório (foco atual):**
1. Piloto: publicar 10-15 profissionais reais pelo `/diretorio/admin` e observar o uso.
2. Depois do piloto, na ordem: avaliações/estrelas → selo "verificado" → dashboard do
   profissional (com login) → caminho pago (`DIRETORIO_EXIGE_ASSINATURA` + checkout).
3. Automatizar o envio do magic link; fotos de perfil.
4. Quando o diretório se provar: apontar `/` para `/diretorio` e remover a rota do webhook.

**Fluxo WhatsApp (manutenção até a virada):**
- Concluir migração Evolution API → WhatsApp Cloud API oficial (cadastro na Meta em andamento).
- Deduplicar mensagens recebidas do webhook (Evolution API às vezes entrega a mesma duas vezes).
- Resolver o domínio sem `www` (`achaiquemfaz.com.br`), hoje sem registro DNS.
- Migrar de Asaas para Pagar.me assim que o CNPJ estiver pronto.
