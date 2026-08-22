import express from "express";
import { env } from "./config/env";
import { webhookRouter } from "./routes/webhook";
import { webhookPagamentoRouter } from "./routes/webhookPagamento";
import { cadastroRouter } from "./routes/cadastro";
import { landingRouter } from "./routes/landing";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/webhook", webhookRouter);
app.use("/webhook", webhookPagamentoRouter);
app.use("/cadastro", cadastroRouter);
app.use("/", landingRouter);

app.listen(env.port, () => {
  console.log(`Achaí Quem Faz rodando na porta ${env.port}`);
});
