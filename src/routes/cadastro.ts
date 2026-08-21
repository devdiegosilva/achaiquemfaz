import { Router } from "express";
import { criarCheckoutAssinatura } from "../services/asaas";
import { criarFornecedorPendente, salvarAsaasCheckoutId } from "../services/supabase";
import { CATEGORIAS, type Categoria } from "../types";

export const cadastroRouter = Router();

const LABEL_CATEGORIA: Record<Categoria, string> = {
  eletricista: "Eletricista",
  encanador: "Encanador",
  pedreiro: "Pedreiro",
  pintor: "Pintor",
  marceneiro: "Marceneiro",
  chaveiro: "Chaveiro",
  jardineiro: "Jardineiro",
  diarista: "Diarista",
  dedetizador: "Dedetizador",
  tecnico_eletrodomesticos: "Técnico em eletrodomésticos",
};

function paginaBase(titulo: string, corpo: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${titulo} — Ache Fornecedores</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0f1115; color: #eaeaea; margin: 0; padding: 0; }
  .container { max-width: 480px; margin: 40px auto; padding: 24px; }
  h1 { font-size: 1.4rem; margin-bottom: 4px; }
  p.subtitle { color: #9aa0a6; margin-top: 0; margin-bottom: 24px; }
  label { display: block; margin-top: 16px; margin-bottom: 4px; font-size: 0.9rem; }
  input, select { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #1a1d24; color: #eaeaea; font-size: 1rem; box-sizing: border-box; }
  button { margin-top: 24px; width: 100%; padding: 12px; border-radius: 6px; border: none; background: #22c55e; color: #08130b; font-weight: bold; font-size: 1rem; cursor: pointer; }
  .msg { text-align: center; margin-top: 60px; }
  .erro { color: #f87171; margin-top: 16px; }
</style>
</head>
<body>
<div class="container">${corpo}</div>
</body>
</html>`;
}

function paginaFormulario(erro?: string): string {
  const opcoes = CATEGORIAS.map((cat) => `<option value="${cat}">${LABEL_CATEGORIA[cat]}</option>`).join("");
  return paginaBase(
    "Cadastro de fornecedor",
    `
    <h1>Cadastre-se como fornecedor</h1>
    <p class="subtitle">Receba demandas de clientes perto de você pelo WhatsApp.</p>
    ${erro ? `<p class="erro">${erro}</p>` : ""}
    <form method="POST" action="/cadastro">
      <label for="nome">Nome completo</label>
      <input type="text" id="nome" name="nome" required />

      <label for="cpfCnpj">CPF ou CNPJ</label>
      <input type="text" id="cpfCnpj" name="cpfCnpj" required />

      <label for="email">E-mail</label>
      <input type="email" id="email" name="email" required />

      <label for="whatsapp">WhatsApp (com DDD, só números)</label>
      <input type="text" id="whatsapp" name="whatsapp" placeholder="5583999999999" required />

      <label for="categoria">Categoria de serviço</label>
      <select id="categoria" name="categoria" required>${opcoes}</select>

      <label for="bairro">Bairro</label>
      <input type="text" id="bairro" name="bairro" required />

      <label for="cidade">Cidade</label>
      <input type="text" id="cidade" name="cidade" value="João Pessoa" required />

      <button type="submit">Continuar para pagamento</button>
    </form>
    `
  );
}

cadastroRouter.get("/", (_req, res) => {
  res.send(paginaFormulario());
});

cadastroRouter.post("/", async (req, res) => {
  const { nome, cpfCnpj, email, whatsapp, categoria, bairro, cidade } = req.body ?? {};

  if (!nome || !cpfCnpj || !email || !whatsapp || !categoria || !bairro || !cidade) {
    return res.status(400).send(paginaFormulario("Preencha todos os campos."));
  }

  if (!CATEGORIAS.includes(categoria)) {
    return res.status(400).send(paginaFormulario("Categoria inválida."));
  }

  try {
    const fornecedorId = await criarFornecedorPendente({ nome, categoria, bairro, cidade, whatsapp, email, cpfCnpj });
    const { link, checkoutId } = await criarCheckoutAssinatura({ nome, cpfCnpj, email, fornecedorId });
    await salvarAsaasCheckoutId(fornecedorId, checkoutId);
    return res.redirect(303, link);
  } catch (error) {
    console.error("Erro ao criar cadastro/checkout:", error);
    return res.status(500).send(paginaFormulario("Não foi possível continuar o cadastro agora. Tente novamente em instantes."));
  }
});

cadastroRouter.get("/sucesso", (_req, res) => {
  res.send(paginaBase("Pagamento confirmado", `<div class="msg"><h1>Pagamento em processamento!</h1><p>Assim que confirmado, seu cadastro fica ativo e você começa a receber demandas.</p></div>`));
});

cadastroRouter.get("/cancelado", (_req, res) => {
  res.send(paginaBase("Pagamento cancelado", `<div class="msg"><h1>Pagamento cancelado</h1><p>Você pode tentar novamente quando quiser.</p></div>`));
});

cadastroRouter.get("/expirado", (_req, res) => {
  res.send(paginaBase("Link expirado", `<div class="msg"><h1>Link de pagamento expirado</h1><p>Faça o cadastro novamente para gerar um novo link.</p></div>`));
});
