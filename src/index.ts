import express from "express";
import { env } from "./config/env";
import { webhookRouter } from "./routes/webhook";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/webhook", webhookRouter);

app.listen(env.port, () => {
  console.log(`Ache Fornecedores rodando na porta ${env.port}`);
});
