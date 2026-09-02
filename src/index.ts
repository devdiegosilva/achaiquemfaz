import express from "express";
import { env } from "./config/env";
import { diretorioRouter } from "./routes/diretorio";
import { diretorioCadastroRouter } from "./routes/diretorioCadastro";
import { diretorioEditarRouter } from "./routes/diretorioEditar";
import { diretorioAdminRouter } from "./routes/diretorioAdmin";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Diretório (/diretorio) — é o produto agora. A ordem importa: rotas mais específicas
// (/cadastro, /editar, /admin) vêm antes de /diretorio, que tem a curinga /p/:slug.
app.use("/diretorio/cadastro", diretorioCadastroRouter);
app.use("/diretorio/editar", diretorioEditarRouter);
app.use("/diretorio/admin", diretorioAdminRouter);
app.use("/diretorio", diretorioRouter);

// Fluxo WhatsApp DESATIVADO em 2026-09-02 (ver README). Os arquivos continuam no repo
// (routes/webhook.ts, webhookPagamento.ts, cadastro.ts, landing.ts, inicio.ts e os
// services ai.ts / whatsapp.ts / mensagens.ts / asaas.ts). Para reativar, remontar os
// routers aqui e devolver as variáveis de ambiente a "required" em config/env.ts.
app.get("/", (_req, res) => res.redirect(302, "/diretorio"));
app.get("/fornecedores", (_req, res) => res.redirect(302, "/diretorio/cadastro"));
app.get("/cadastro", (_req, res) => res.redirect(302, "/diretorio/cadastro"));

app.listen(env.port, () => {
  console.log(`Achaí Quem Faz rodando na porta ${env.port}`);
});
