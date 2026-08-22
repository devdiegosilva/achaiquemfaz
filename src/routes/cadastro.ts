import { Router } from "express";
import axios from "axios";
import { criarCheckoutAssinatura } from "../services/asaas";
import { criarFornecedorPendente, salvarAsaasCheckoutId, removerFornecedor } from "../services/supabase";
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
      <input type="text" id="cpfCnpj" name="cpfCnpj" inputmode="numeric" placeholder="000.000.000-00" required />

      <label for="email">E-mail</label>
      <input type="email" id="email" name="email" required />

      <label for="whatsapp">WhatsApp</label>
      <div style="display: flex; gap: 8px;">
        <span style="padding: 10px; border: 1px solid #333; border-radius: 6px; background: #1a1d24; color: #9aa0a6;">+55</span>
        <input type="tel" id="whatsapp" name="whatsapp" inputmode="numeric" placeholder="(83) 99999-9999" required style="flex: 1;" />
      </div>

      <label for="categoria">Categoria de serviço</label>
      <select id="categoria" name="categoria" required>${opcoes}</select>

      <label for="bairro">Bairro</label>
      <input type="text" id="bairro" name="bairro" required />

      <label for="cidade">Cidade</label>
      <input type="text" id="cidade" name="cidade" value="João Pessoa" required />

      <p class="subtitle" style="margin-top: 24px;">Dados de cobrança (necessários para o pagamento por cartão)</p>

      <label for="cep">CEP</label>
      <input type="text" id="cep" name="cep" inputmode="numeric" placeholder="00000-000" required />

      <label for="endereco">Endereço (rua)</label>
      <input type="text" id="endereco" name="endereco" required />

      <label for="numero">Número</label>
      <input type="text" id="numero" name="numero" inputmode="numeric" required />

      <button type="submit">Continuar para pagamento</button>
    </form>
    <script>
      function apenasDigitos(v) { return v.replace(/\\D/g, ""); }

      document.getElementById("cpfCnpj").addEventListener("input", function () {
        var v = apenasDigitos(this.value).slice(0, 14);
        if (v.length <= 11) {
          v = v.replace(/(\\d{3})(\\d)/, "$1.$2").replace(/(\\d{3})(\\d)/, "$1.$2").replace(/(\\d{3})(\\d{1,2})$/, "$1-$2");
        } else {
          v = v.replace(/(\\d{2})(\\d)/, "$1.$2").replace(/(\\d{3})(\\d)/, "$1.$2").replace(/(\\d{3})(\\d)/, "$1/$2").replace(/(\\d{4})(\\d{1,2})$/, "$1-$2");
        }
        this.value = v;
      });

      document.getElementById("cep").addEventListener("input", function () {
        var v = apenasDigitos(this.value).slice(0, 8);
        v = v.replace(/(\\d{5})(\\d)/, "$1-$2");
        this.value = v;
      });

      document.getElementById("whatsapp").addEventListener("input", function () {
        var v = apenasDigitos(this.value).slice(0, 11);
        if (v.length > 10) {
          v = v.replace(/(\\d{2})(\\d{5})(\\d{4})/, "($1) $2-$3");
        } else if (v.length > 5) {
          v = v.replace(/(\\d{2})(\\d{4})(\\d{0,4})/, "($1) $2-$3");
        } else if (v.length > 2) {
          v = v.replace(/(\\d{2})(\\d{0,5})/, "($1) $2");
        } else if (v.length > 0) {
          v = v.replace(/(\\d{0,2})/, "($1");
        }
        this.value = v;
      });

      document.getElementById("numero").addEventListener("input", function () {
        this.value = apenasDigitos(this.value);
      });
    </script>
    `
  );
}

cadastroRouter.get("/", (_req, res) => {
  res.send(paginaFormulario());
});

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

cadastroRouter.post("/", async (req, res) => {
  const { nome, cpfCnpj: cpfCnpjBruto, email, whatsapp: whatsappBruto, categoria, bairro, cidade, cep: cepBruto, endereco, numero } = req.body ?? {};

  if (!nome || !cpfCnpjBruto || !email || !whatsappBruto || !categoria || !bairro || !cidade || !cepBruto || !endereco || !numero) {
    return res.status(400).send(paginaFormulario("Preencha todos os campos."));
  }

  if (!CATEGORIAS.includes(categoria)) {
    return res.status(400).send(paginaFormulario("Categoria inválida."));
  }

  // O formulário já mascara esses campos, mas normalizamos aqui também (defesa extra,
  // e é o formato que o resto do sistema espera: WhatsApp sempre com DDI 55).
  const cpfCnpj = somenteDigitos(cpfCnpjBruto);
  const cep = somenteDigitos(cepBruto);
  const whatsapp = `55${somenteDigitos(whatsappBruto)}`;

  let fornecedorId: string | undefined;

  try {
    fornecedorId = await criarFornecedorPendente({ nome, categoria, bairro, cidade, whatsapp, email, cpfCnpj });
    const { link, checkoutId } = await criarCheckoutAssinatura({
      nome,
      cpfCnpj,
      email,
      whatsapp,
      bairro,
      endereco,
      numero,
      cep,
      fornecedorId,
    });
    await salvarAsaasCheckoutId(fornecedorId, checkoutId);
    return res.redirect(303, link);
  } catch (error) {
    if (fornecedorId) {
      await removerFornecedor(fornecedorId).catch((erroLimpeza) =>
        console.error("Falha ao remover cadastro pendente após erro:", erroLimpeza)
      );
    }

    if (axios.isAxiosError(error) && Array.isArray(error.response?.data?.errors)) {
      const mensagens = (error.response.data.errors as Array<{ description: string }>)
        .map((e) => e.description)
        .join(" ");
      console.error("Erro ao criar cadastro/checkout (resposta do Asaas):", JSON.stringify(error.response.data));
      return res.status(400).send(paginaFormulario(mensagens));
    }

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
