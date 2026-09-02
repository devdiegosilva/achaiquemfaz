import express from "express";
import { env } from "./config/env";
import { diretorioRouter } from "./routes/diretorio";
import { diretorioCadastroRouter } from "./routes/diretorioCadastro";
import { diretorioEditarRouter } from "./routes/diretorioEditar";
import { diretorioAdminRouter } from "./routes/diretorioAdmin";
import { eventosRouter } from "./routes/eventos";
import { TRACK_JS } from "./services/trackScript";

const app = express();
// Atrás do proxy da Railway — sem isto req.ip é o IP do proxy (rate limit vira global).
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Analytics próprio.
app.get("/aqf.js", (_req, res) => {
  res.type("application/javascript");
  res.set("Cache-Control", "public, max-age=3600");
  res.send(TRACK_JS);
});
app.use("/api", eventosRouter);

// O diretório é o produto e vive na raiz. A ordem importa: rotas específicas
// (/cadastro, /editar, /admin) antes de "/", que tem a curinga /p/:slug.
app.use("/cadastro", diretorioCadastroRouter);
app.use("/editar", diretorioEditarRouter);
app.use("/admin", diretorioAdminRouter);

// Compat: a estrutura antiga era /diretorio/*. Redireciona para a raiz (301).
// req.url aqui já vem sem o prefixo "/diretorio" (Express).
app.use("/diretorio", (req, res) => res.redirect(301, req.url === "/" ? "/" : req.url));

// Fluxo WhatsApp DESATIVADO em 2026-09-02 (ver README). Arquivos seguem no repo
// (routes/webhook.ts, webhookPagamento.ts, cadastro.ts, landing.ts, inicio.ts;
// services ai.ts / whatsapp.ts / mensagens.ts / asaas.ts), apenas não montados.
// Reativar: remontar os routers e devolver as env vars a "required" em config/env.ts.
app.get("/fornecedores", (_req, res) => res.redirect(301, "/cadastro"));

app.use("/", diretorioRouter);

app.listen(env.port, () => {
  console.log(`Achaí Quem Faz rodando na porta ${env.port}`);
});
