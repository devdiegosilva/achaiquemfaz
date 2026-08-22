import { Router } from "express";
import axios from "axios";
import { criarCheckoutAssinatura } from "../services/asaas";
import { criarFornecedorPendente, salvarAsaasCheckoutId, removerFornecedor } from "../services/supabase";
import { paginaTicket } from "../services/html";
import { CATEGORIAS_BASE } from "../types";

export const cadastroRouter = Router();

const CSS_FORMULARIO = `
  form label { display: block; margin-top: 20px; margin-bottom: 6px; font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); }
  form input, form select {
    width: 100%; padding: 11px 12px; border: 1px solid var(--line-strong); background: var(--paper-alt);
    color: var(--ink); font-family: var(--font-body); font-size: 1rem; border-radius: 2px; box-sizing: border-box;
  }
  form input:focus, form select:focus { outline: 2px solid var(--work); outline-offset: 1px; }
  .campo-tel { display: flex; gap: 8px; }
  .campo-tel .ddi { padding: 11px 12px; border: 1px solid var(--line-strong); background: var(--paper-alt); color: var(--ink-muted); font-family: var(--font-mono); border-radius: 2px; }
  .campo-tel input { flex: 1; }
  .erro { font-family: var(--font-mono); font-size: 0.85rem; color: var(--stamp); border: 1px dashed var(--stamp); padding: 10px 12px; margin: 0 0 8px; }
  form .stamp-btn { width: 100%; text-align: center; margin-top: 30px; }
  .rotulo-secao { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); margin: 0; }
`;

function paginaFormulario(erro?: string): string {
  const opcoes = Object.entries(CATEGORIAS_BASE)
    .map(([valor, rotulo]) => `<option value="${valor}">${rotulo}</option>`)
    .join("");

  const secoes = `
    <section class="cadastro">
      <h2>Cadastre-se como fornecedor</h2>
      <p class="lede">Receba demandas de clientes perto de você pelo WhatsApp.</p>
      ${erro ? `<p class="erro">${erro}</p>` : ""}
      <form method="POST" action="/cadastro">
        <label for="nome">Nome completo</label>
        <input type="text" id="nome" name="nome" required />

        <label for="cpfCnpj">CPF ou CNPJ</label>
        <input type="text" id="cpfCnpj" name="cpfCnpj" inputmode="numeric" placeholder="000.000.000-00" required />

        <label for="email">E-mail</label>
        <input type="email" id="email" name="email" required />

        <label for="whatsapp">WhatsApp</label>
        <div class="campo-tel">
          <span class="ddi">+55</span>
          <input type="tel" id="whatsapp" name="whatsapp" inputmode="numeric" placeholder="(83) 99999-9999" required />
        </div>

        <label for="categoria">Categoria de serviço</label>
        <select id="categoria" name="categoria" required>
          <option value="">Selecione...</option>
          ${opcoes}
          <option value="outro">Outro (não está na lista)</option>
        </select>

        <div id="categoriaOutraWrapper" style="display: none;">
          <label for="categoriaOutra">Qual serviço você presta?</label>
          <input type="text" id="categoriaOutra" name="categoriaOutra" placeholder="Ex: personal organizer" />
        </div>

        <label for="bairro">Bairro</label>
        <input type="text" id="bairro" name="bairro" required />

        <label for="cidade">Cidade</label>
        <input type="text" id="cidade" name="cidade" value="João Pessoa" required />

        <div class="tear" aria-hidden="true" style="margin-top: 28px;"></div>
        <p class="rotulo-secao" style="margin-top: 24px;">Dados de cobrança — necessários para o pagamento por cartão</p>

        <label for="cep">CEP</label>
        <input type="text" id="cep" name="cep" inputmode="numeric" placeholder="00000-000" required />

        <label for="endereco">Endereço (rua)</label>
        <input type="text" id="endereco" name="endereco" required />

        <label for="numero">Número</label>
        <input type="text" id="numero" name="numero" inputmode="numeric" required />

        <button type="submit" class="stamp-btn">Continuar para pagamento</button>
      </form>
    </section>
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

      document.getElementById("categoria").addEventListener("change", function () {
        var wrapper = document.getElementById("categoriaOutraWrapper");
        var campoOutro = document.getElementById("categoriaOutra");
        if (this.value === "outro") {
          wrapper.style.display = "block";
          campoOutro.required = true;
        } else {
          wrapper.style.display = "none";
          campoOutro.required = false;
          campoOutro.value = "";
        }
      });
    </script>
  `;

  return paginaTicket("Cadastro de fornecedor", secoes, CSS_FORMULARIO);
}

cadastroRouter.get("/", (_req, res) => {
  res.send(paginaFormulario());
});

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

cadastroRouter.post("/", async (req, res) => {
  const {
    nome,
    cpfCnpj: cpfCnpjBruto,
    email,
    whatsapp: whatsappBruto,
    categoria: categoriaSelecionada,
    categoriaOutra,
    bairro,
    cidade,
    cep: cepBruto,
    endereco,
    numero,
  } = req.body ?? {};

  if (!nome || !cpfCnpjBruto || !email || !whatsappBruto || !categoriaSelecionada || !bairro || !cidade || !cepBruto || !endereco || !numero) {
    return res.status(400).send(paginaFormulario("Preencha todos os campos."));
  }

  let categoria: string;
  if (categoriaSelecionada === "outro") {
    if (!categoriaOutra || !categoriaOutra.trim()) {
      return res.status(400).send(paginaFormulario("Informe qual serviço você presta."));
    }
    categoria = categoriaOutra.trim().toLowerCase();
  } else if (!Object.keys(CATEGORIAS_BASE).includes(categoriaSelecionada)) {
    return res.status(400).send(paginaFormulario("Categoria inválida."));
  } else {
    categoria = categoriaSelecionada;
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
  res.send(
    paginaTicket(
      "Pagamento confirmado",
      `<section class="msg"><h2>Pagamento em processamento!</h2><p class="lede" style="margin: 0 auto;">Assim que confirmado, seu cadastro fica ativo e você começa a receber demandas.</p></section>`
    )
  );
});

cadastroRouter.get("/cancelado", (_req, res) => {
  res.send(
    paginaTicket(
      "Pagamento cancelado",
      `<section class="msg"><h2>Pagamento cancelado</h2><p class="lede" style="margin: 0 auto;">Você pode tentar novamente quando quiser.</p></section>`
    )
  );
});

cadastroRouter.get("/expirado", (_req, res) => {
  res.send(
    paginaTicket(
      "Link expirado",
      `<section class="msg"><h2>Link de pagamento expirado</h2><p class="lede" style="margin: 0 auto;">Faça o cadastro novamente para gerar um novo link.</p></section>`
    )
  );
});
