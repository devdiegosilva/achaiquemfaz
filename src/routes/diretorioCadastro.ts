import { Router } from "express";
import { paginaSite, escaparHtml } from "../services/html";
import { criarPerfilDiretorio } from "../services/supabase";
import { env } from "../config/env";
import {
  CSS_FORM_DIRETORIO,
  campoCategoria,
  campoBairro,
  checkboxesSegmento,
  parseServicos,
  parseSegmentos,
  somenteDigitos,
  JS_CATEGORIA_OUTRO,
} from "../services/diretorioCampos";

export const diretorioCadastroRouter = Router();

// Resolve a categoria final a partir do body (trata a opção "Outro").
function resolverCategoria(body: Record<string, unknown>): { categoria: string; erro?: string } {
  const escolhida = typeof body.categoria === "string" ? body.categoria.trim() : "";
  if (escolhida !== "outro") return { categoria: escolhida };
  const outra = typeof body.categoriaOutra === "string" ? body.categoriaOutra.trim() : "";
  if (!outra) return { categoria: "", erro: "Diga qual serviço você presta." };
  return { categoria: outra.toLowerCase() };
}

function paginaFormulario(erro?: string, valores: Record<string, string> = {}): string {
  const v = (campo: string) => escaparHtml(valores[campo] ?? "");
  const gratis = env.diretorioExigeAssinatura ? "" : " É grátis durante o lançamento.";
  const confirmaEntra = env.diretorioExigeAssinatura
    ? "fica pendente de revisão e entra no ar quando aprovado"
    : "entra no ar na hora";

  const secoes = `
    <div class="formwrap">
      <h1>Cadastre seu serviço</h1>
      <p class="lead">Apareça para quem procura profissionais para casa e condomínio em João Pessoa. O cliente fala com você direto no WhatsApp.${gratis}</p>
      ${erro ? `<p class="form-erro">${escaparHtml(erro)}</p>` : ""}

      <form id="wiz" class="wiz" method="POST" action="/cadastro">
        <div class="wiz-head" hidden>
          <div class="wiz-bar"><span></span><span></span><span></span><span></span><span></span></div>
          <div class="wiz-stepnum"></div>
        </div>

        <section class="wstep">
          <h2>Seus dados</h2>
          <p class="stepdesc">Como o cliente vai te ver e te chamar.</p>
          <div class="fld">
            <label for="nome">Nome (como o cliente vai te ver)</label>
            <input type="text" id="nome" name="nome" value="${v("nome")}" required />
          </div>
          <div class="fld">
            <label for="whatsapp">WhatsApp</label>
            <div class="campo-tel">
              <span class="ddi">+55</span>
              <input type="tel" id="whatsapp" name="whatsapp" inputmode="numeric" value="${v("whatsapp")}" placeholder="(83) 99999-9999" required />
            </div>
          </div>
          <div class="fld">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" value="${v("email")}" required />
            <p class="hint">Só pra gente te mandar recados. <strong>Não aparece no seu perfil.</strong></p>
          </div>
        </section>

        <section class="wstep">
          <h2>O que você faz</h2>
          <p class="stepdesc">Escolha o serviço principal e liste o que você atende.</p>
          ${campoCategoria(valores.categoria ?? "")}
          <div class="fld">
            <label for="servicos">O que você faz <span style="font-weight:400;color:var(--text-subtle)">(opcional)</span> — um por linha</label>
            <textarea id="servicos" name="servicos" placeholder="Instalação de chuveiro&#10;Troca de tomadas&#10;Reparo de vazamento">${v("servicos")}</textarea>
          </div>
          <div class="fld">
            <label>Atende</label>
            <div class="chk-row">${checkboxesSegmento(["casa", "condominio"])}</div>
          </div>
        </section>

        <section class="wstep">
          <h2>Onde você atua</h2>
          <p class="stepdesc">O bairro ajuda o cliente a te achar na busca.</p>
          ${campoBairro(valores.bairro ?? "")}
        </section>

        <section class="wstep">
          <h2>Sobre você</h2>
          <p class="stepdesc">Um texto curto que passa confiança pro cliente.</p>
          <div class="fld">
            <label for="descricao">Sua apresentação <span style="font-weight:400;color:var(--text-subtle)">(opcional)</span></label>
            <textarea id="descricao" name="descricao" placeholder="Experiência, anos de atuação, o que te diferencia, garantia do serviço.">${v("descricao")}</textarea>
          </div>
        </section>

        <section class="wstep">
          <h2>Confirme e publique</h2>
          <p class="stepdesc">Revise seus dados — você pode editar tudo depois.</p>
          <dl class="wiz-resumo">
            <div><dt>Nome</dt><dd data-r="nome">—</dd></div>
            <div><dt>WhatsApp</dt><dd data-r="whatsapp">—</dd></div>
            <div><dt>E-mail</dt><dd data-r="email">—</dd></div>
            <div><dt>Serviço</dt><dd data-r="categoria">—</dd></div>
            <div><dt>Bairro</dt><dd data-r="bairro">—</dd></div>
          </dl>
          <p class="hint">Ao cadastrar, seu perfil ${confirmaEntra}. Você recebe um link só seu pra editar depois.</p>
          <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:18px">Cadastrar</button>
        </section>

        <div class="wiz-nav" hidden>
          <button type="button" class="btn btn-ghost wiz-back" hidden>← Voltar</button>
          <button type="button" class="btn btn-primary wiz-next">Continuar</button>
        </div>
      </form>
    </div>
    <script>
      (function () {
        var wa = document.getElementById("whatsapp");
        if (wa) wa.addEventListener("input", function () {
          var x = this.value.replace(/\\D/g, "").slice(0, 11);
          if (x.length > 10) x = x.replace(/(\\d{2})(\\d{5})(\\d{4})/, "($1) $2-$3");
          else if (x.length > 6) x = x.replace(/(\\d{2})(\\d{4})(\\d{0,4})/, "($1) $2-$3");
          else if (x.length > 2) x = x.replace(/(\\d{2})(\\d{0,5})/, "($1) $2");
          this.value = x;
        });

        var f = document.getElementById("wiz");
        if (!f) return;
        var steps = [].slice.call(f.querySelectorAll(".wstep"));
        var head = f.querySelector(".wiz-head");
        var bar = [].slice.call(f.querySelectorAll(".wiz-bar span"));
        var num = f.querySelector(".wiz-stepnum");
        var nav = f.querySelector(".wiz-nav");
        var back = f.querySelector(".wiz-back");
        var next = f.querySelector(".wiz-next");
        var titulos = ["Dados básicos", "Serviços", "Localização", "Sobre você", "Confirmar"];
        var i = 0;

        f.classList.add("js");
        if (head) head.hidden = false;
        if (nav) nav.hidden = false;

        function resumo() {
          [].slice.call(f.querySelectorAll("[data-r]")).forEach(function (dd) {
            var name = dd.getAttribute("data-r");
            var el = name === "categoria" && f.querySelector('#categoria').value === "outro"
              ? f.querySelector('[name="categoriaOutra"]')
              : f.querySelector('[name="' + name + '"]');
            var val = "";
            if (el) val = el.tagName === "SELECT" ? (el.options[el.selectedIndex] || {}).text || "" : el.value;
            dd.textContent = (val || "").trim() || "—";
          });
        }
        function render(scroll) {
          steps.forEach(function (s, k) { s.hidden = k !== i; });
          bar.forEach(function (b, k) { b.className = k <= i ? "done" : ""; });
          if (num) num.textContent = "Etapa " + (i + 1) + " de " + steps.length + " · " + titulos[i];
          if (back) back.hidden = i === 0;
          if (next) next.hidden = i === steps.length - 1;
          if (i === steps.length - 1) resumo();
          if (scroll) f.scrollIntoView({ block: "start" });
        }
        function valida(step) {
          var els = step.querySelectorAll("input, select, textarea");
          for (var j = 0; j < els.length; j++) {
            if (els[j].offsetParent === null && els[j].type !== "hidden") continue;
            if (!els[j].checkValidity()) { els[j].reportValidity(); return false; }
          }
          return true;
        }
        if (next) next.addEventListener("click", function () {
          if (valida(steps[i]) && i < steps.length - 1) { i++; render(true); }
        });
        if (back) back.addEventListener("click", function () {
          if (i > 0) { i--; render(true); }
        });
        render(false);
      })();
      ${JS_CATEGORIA_OUTRO}
    </script>
  `;

  return paginaSite({ titulo: "Cadastre seu serviço", secoes, cssExtra: CSS_FORM_DIRETORIO, largura: "estreita" });
}

function paginaSucesso(nome: string, slug: string, publicado: boolean, linkEdicao: string): string {
  const secoes = `
    <div class="formwrap">
      <h1>Pronto, ${escaparHtml(nome)}!</h1>
      <p class="lead">${
        publicado
          ? `Seu perfil já está no ar. <a href="/p/${escaparHtml(slug)}">Ver como ficou</a>.`
          : "Recebemos seu cadastro. Ele entra no ar assim que for revisado."
      }</p>
      <div class="form-ok">Guarde este link — ele é só seu. É por ele que você edita ou tira seu perfil do ar depois.</div>
      <div class="linkbox">${escaparHtml(linkEdicao)}</div>
      <a class="btn btn-primary" href="${escaparHtml(linkEdicao)}">Abrir meu perfil pra editar</a>
    </div>
  `;
  return paginaSite({ titulo: "Cadastro recebido", secoes, cssExtra: CSS_FORM_DIRETORIO, largura: "estreita" });
}

diretorioCadastroRouter.get("/", (_req, res) => {
  res.send(paginaFormulario());
});

diretorioCadastroRouter.post("/", async (req, res) => {
  const body = req.body ?? {};
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const whatsappBruto = typeof body.whatsapp === "string" ? body.whatsapp : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const bairro = typeof body.bairro === "string" ? body.bairro.trim() : "";
  const descricao = typeof body.descricao === "string" ? body.descricao.trim() : "";
  const { categoria, erro: erroCategoria } = resolverCategoria(body);

  const valores: Record<string, string> = {
    nome,
    whatsapp: whatsappBruto,
    email,
    categoria,
    bairro,
    descricao,
    servicos: typeof body.servicos === "string" ? body.servicos : "",
  };

  const whatsappDigitos = somenteDigitos(whatsappBruto);

  if (erroCategoria) {
    return res.status(400).send(paginaFormulario(erroCategoria, valores));
  }
  if (!nome || !categoria || !email || whatsappDigitos.length < 10 || whatsappDigitos.length > 11) {
    return res
      .status(400)
      .send(paginaFormulario("Preencha nome, WhatsApp válido (com DDD), e-mail e o serviço principal.", valores));
  }

  try {
    const { slug, editToken } = await criarPerfilDiretorio({
      nome,
      categoria,
      servicos: parseServicos(body.servicos),
      bairro: bairro || null,
      cidade: "João Pessoa",
      whatsapp: `55${whatsappDigitos}`,
      email,
      descricao: descricao || null,
      segmentos: parseSegmentos(body.segmentos),
      // Lançamento: publica na hora. Quando exigir assinatura, entra despublicado
      // e só vai ao ar após o pagamento (a implementar).
      publicado: !env.diretorioExigeAssinatura,
    });

    const linkEdicao = `${env.backendPublicUrl}/editar?token=${editToken}`;
    return res.send(paginaSucesso(nome, slug, !env.diretorioExigeAssinatura, linkEdicao));
  } catch (error) {
    console.error("Erro ao cadastrar perfil no diretório:", error);
    return res
      .status(500)
      .send(paginaFormulario("Não foi possível concluir o cadastro agora. Tente novamente em instantes.", valores));
  }
});
