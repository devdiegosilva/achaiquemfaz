import express from "express";
import { env } from "./config/env";
import { webhookRouter } from "./routes/webhook";
import { webhookPagamentoRouter } from "./routes/webhookPagamento";
import { cadastroRouter } from "./routes/cadastro";
import { landingRouter } from "./routes/landing";
import { inicioRouter } from "./routes/inicio";
import { diretorioRouter } from "./routes/diretorio";
import { diretorioCadastroRouter } from "./routes/diretorioCadastro";
import { diretorioEditarRouter } from "./routes/diretorioEditar";
import { diretorioAdminRouter } from "./routes/diretorioAdmin";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/webhook", webhookRouter);
app.use("/webhook", webhookPagamentoRouter);
app.use("/cadastro", cadastroRouter);
app.use("/fornecedores", landingRouter);

// Módulo Diretório (/diretorio) — em paralelo ao fluxo do WhatsApp acima.
// A ordem importa: as rotas mais específicas (/cadastro, /editar, /admin) vêm antes
// de /diretorio, que tem a rota curinga /p/:slug.
app.use("/diretorio/cadastro", diretorioCadastroRouter);
app.use("/diretorio/editar", diretorioEditarRouter);
app.use("/diretorio/admin", diretorioAdminRouter);
app.use("/diretorio", diretorioRouter);

app.use("/", inicioRouter);

app.listen(env.port, () => {
  console.log(`Achaí Quem Faz rodando na porta ${env.port}`);
});
