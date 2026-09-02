import { Router } from "express";
import { paginaSite, escaparHtml } from "../services/html";
import { listarPerfisAdmin, definirPublicado, definirVerificado, buscarPerfisPublicados } from "../services/supabase";
import { buscarEventosPeriodo, calcularMetricas, type Metricas, type LinhaDemanda } from "../services/metricas";
import { env } from "../config/env";

export const diretorioAdminRouter = Router();

// Gate simples por chave em query string / campo hidden. Se ADMIN_CHAVE não estiver
// configurada, o painel responde 404 (não revela que existe).
function chaveValida(valor: unknown): boolean {
  return Boolean(env.adminChave) && typeof valor === "string" && valor === env.adminChave;
}

const CSS_ADMIN = `
  .adminwrap { padding: 30px clamp(16px, 4vw, 32px) 48px; }
  .adminwrap h1 { font-family: var(--font-head); font-weight: 800; font-size: 1.6rem; margin: 0 0 4px; }
  .adminwrap .lead { color: var(--text-muted); font-size: 0.95rem; margin: 0 0 20px; }
  .adm { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--r-md); }
  table.adm-t { border-collapse: collapse; width: 100%; font-size: 0.88rem; min-width: 900px; }
  table.adm-t th, table.adm-t td { border-bottom: 1px solid var(--border); padding: 10px 12px; text-align: left; vertical-align: top; }
  table.adm-t th { font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-subtle); background: var(--surface-2); }
  table.adm-t tbody tr:last-child td { border-bottom: none; }
  table.adm-t tbody tr:hover td { background: var(--surface-2); }
  table.adm-t td.mono { font-family: var(--font-mono); font-size: 0.74rem; word-break: break-all; max-width: 300px; color: var(--text-muted); }
  .st { display: inline-block; font-family: var(--font-mono); font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.03em; padding: 3px 8px; border-radius: var(--r-pill); }
  .st.on { background: var(--success-weak); color: var(--success); border: 1px solid var(--success); }
  .st.off { border: 1px solid var(--border-strong); color: var(--text-subtle); }
  .st.verif { background: var(--primary-weak); color: var(--primary); border: 1px solid var(--primary); }
  form.inline { display: inline; }
  form.inline button { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; padding: 5px 10px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); cursor: pointer; border-radius: var(--r-sm); }
  form.inline button:hover { background: var(--surface-3); }
  .adm-ver { font-family: var(--font-mono); font-size: 0.72rem; margin-left: 6px; }
  .adm-nav { display: flex; gap: 14px; font-family: var(--font-mono); font-size: 0.78rem; margin-bottom: 18px; }
  .adm-nav a { color: var(--text-muted); text-decoration: none; }
  .adm-nav a[aria-current="true"] { color: var(--text); font-weight: 600; }

  .periodo { display: flex; gap: 6px; margin: 4px 0 22px; }
  .periodo a { font-family: var(--font-mono); font-size: 0.76rem; padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--r-sm); text-decoration: none; color: var(--text-muted); }
  .periodo a[aria-current="true"] { background: var(--primary); color: #fff; border-color: var(--primary); }
  .mtr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(148px, 1fr)); gap: 12px; margin: 6px 0 8px; }
  .mtr-card { border: 1px solid var(--border); border-radius: var(--r-md); padding: 14px 16px; background: var(--surface); }
  .mtr-card .n { font-family: var(--font-head); font-weight: 800; font-size: 1.7rem; line-height: 1; }
  .mtr-card .l { font-family: var(--font-mono); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-subtle); margin-top: 6px; }
  .mtr-card.alerta { border-color: var(--accent); }
  .mtr-card.alerta .n { color: var(--accent); }
  .mtr-h2 { font-family: var(--font-head); font-weight: 700; font-size: 1.15rem; margin: 34px 0 2px; }
  .mtr-h2.top { color: var(--accent); margin-top: 8px; }
  .mtr-sub { color: var(--text-muted); font-size: 0.85rem; margin: 0 0 12px; }
  .mtr-aviso { background: var(--warning-weak); border: 1px solid var(--warning); color: var(--warning); border-radius: var(--r-sm); padding: 9px 12px; font-size: 0.82rem; margin-bottom: 16px; }
`;

function render(perfis: Awaited<ReturnType<typeof listarPerfisAdmin>>, chave: string): string {
  const total = perfis.length;
  const publicados = perfis.filter((p) => p.publicado).length;

  const linhas = perfis
    .map((p) => {
      const linkEdicao = `${env.backendPublicUrl}/editar?token=${p.edit_token}`;
      const convite = `Oi! O Achaí Quem Faz agora tem uma vitrine online de profissionais para casa e condomínio em João Pessoa. Quer que a gente publique seu perfil? É grátis. Confira e complete seus dados: ${linkEdicao}`;
      const verif = Boolean(p.telefone_verificado);
      return `
      <tr>
        <td>${escaparHtml(p.nome)}<br /><span style="color:var(--text-subtle);font-size:0.8rem">${escaparHtml(p.categoria)}</span></td>
        <td style="font-family:var(--font-mono);font-size:0.8rem">${escaparHtml(p.whatsapp)}</td>
        <td>${p.publicado ? '<span class="st on">no ar</span>' : '<span class="st off">oculto</span>'}</td>
        <td>
          ${verif ? '<span class="st verif">verificado</span><br />' : ""}
          <form class="inline" method="POST" action="/admin/verificar">
            <input type="hidden" name="chave" value="${escaparHtml(chave)}" />
            <input type="hidden" name="id" value="${escaparHtml(p.id)}" />
            <input type="hidden" name="verificado" value="${verif ? "0" : "1"}" />
            <button type="submit">${verif ? "Desmarcar" : "Marcar verificado"}</button>
          </form>
        </td>
        <td>
          <form class="inline" method="POST" action="/admin/publicar">
            <input type="hidden" name="chave" value="${escaparHtml(chave)}" />
            <input type="hidden" name="id" value="${escaparHtml(p.id)}" />
            <input type="hidden" name="publicado" value="${p.publicado ? "0" : "1"}" />
            <button type="submit">${p.publicado ? "Ocultar" : "Publicar"}</button>
          </form>
          ${p.publicado ? `<a class="adm-ver" href="/p/${escaparHtml(p.slug)}" target="_blank" rel="noopener">ver</a>` : ""}
        </td>
        <td class="mono">${escaparHtml(linkEdicao)}</td>
        <td class="mono">${escaparHtml(convite)}</td>
      </tr>`;
    })
    .join("");

  const verificados = perfis.filter((p) => p.telefone_verificado).length;

  const secoes = `
    <div class="adminwrap">
      <div class="adm-nav">
        <a href="/admin?chave=${encodeURIComponent(chave)}" aria-current="true">Perfis</a>
        <a href="/admin/metricas?chave=${encodeURIComponent(chave)}">Métricas</a>
      </div>
      <h1>Painel do diretório</h1>
      <p class="lead">${publicados} de ${total} ${total === 1 ? "perfil" : "perfis"} no ar · ${verificados} com telefone verificado. Marque "verificado" quando conseguir falar com o profissional pelo número cadastrado.</p>
      <div class="adm">
        <table class="adm-t">
          <thead>
            <tr><th>Nome</th><th>WhatsApp</th><th>Status</th><th>Telefone</th><th>Publicação</th><th>Link de edição</th><th>Mensagem de convite</th></tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    </div>
  `;

  return paginaSite({ titulo: "Painel do diretório", secoes, cssExtra: CSS_ADMIN });
}

// ─────────────────────────────  MÉTRICAS  ─────────────────────────────

function pct(x: number): string {
  return (x * 100).toFixed(1).replace(".", ",") + "%";
}

function tabelaDemanda(linhas: LinhaDemanda[]): string {
  if (!linhas.length) return `<p class="mtr-sub">Sem dados no período.</p>`;
  return `<div class="adm"><table class="adm-t" style="min-width:0">
    <thead><tr><th>Serviço</th><th>Bairro</th><th>Sessões</th><th>Buscas</th></tr></thead>
    <tbody>${linhas
      .map(
        (l) =>
          `<tr><td>${escaparHtml(l.servico)}</td><td>${escaparHtml(l.bairro)}</td><td style="font-variant-numeric:tabular-nums">${l.sessoes}</td><td style="font-variant-numeric:tabular-nums">${l.buscas}</td></tr>`
      )
      .join("")}</tbody>
  </table></div>`;
}

function renderMetricas(m: Metricas, chave: string, periodo: "7d" | "30d", truncado: boolean): string {
  const q = encodeURIComponent(chave);
  const linkP = (p: string) =>
    `<a href="/admin/metricas?chave=${q}&periodo=${p}"${p === periodo ? ' aria-current="true"' : ""}>${p === "7d" ? "7 dias" : "30 dias"}</a>`;

  const profs = m.profissionais.length
    ? `<div class="adm"><table class="adm-t" style="min-width:0">
        <thead><tr><th>Profissional</th><th>Serviço</th><th>Perfis vistos</th><th>Cliques (card)</th><th>Cliques (perfil)</th><th>Cliques total</th></tr></thead>
        <tbody>${m.profissionais
          .map(
            (p) =>
              `<tr><td>${escaparHtml(p.nome)}</td><td>${escaparHtml(p.categoria)}</td><td style="font-variant-numeric:tabular-nums">${p.perfis_vistos}</td><td style="font-variant-numeric:tabular-nums">${p.cliques_card}</td><td style="font-variant-numeric:tabular-nums">${p.cliques_perfil}</td><td style="font-variant-numeric:tabular-nums;font-weight:600">${p.cliques_total}</td></tr>`
          )
          .join("")}</tbody>
      </table></div>`
    : `<p class="mtr-sub">Nenhum profissional publicado.</p>`;

  const origens = m.origens.length
    ? `<div class="adm"><table class="adm-t" style="min-width:0">
        <thead><tr><th>utm_source</th><th>utm_campaign</th><th>Sessões</th><th>Eventos</th></tr></thead>
        <tbody>${m.origens
          .map(
            (o) =>
              `<tr><td>${escaparHtml(o.utm_source)}</td><td>${escaparHtml(o.utm_campaign)}</td><td style="font-variant-numeric:tabular-nums">${o.sessoes}</td><td style="font-variant-numeric:tabular-nums">${o.eventos}</td></tr>`
          )
          .join("")}</tbody>
      </table></div>`
    : `<p class="mtr-sub">Sem dados no período.</p>`;

  const secoes = `
    <div class="adminwrap">
      <div class="adm-nav">
        <a href="/admin?chave=${q}">Perfis</a>
        <a href="/admin/metricas?chave=${q}" aria-current="true">Métricas</a>
      </div>
      <h1>Métricas do funil</h1>
      <p class="lead">Onde está o gargalo: falta de demanda, de oferta, ou de conversão. Tráfego interno excluído.
        <a href="#" onclick="try{localStorage.setItem('aqf_interno','1');this.textContent=' ✓ marcado';}catch(e){}return false;" style="font-family:var(--font-mono);font-size:0.8rem">marcar este navegador como interno</a>
      </p>
      <div class="periodo">${linkP("7d")} ${linkP("30d")}</div>

      ${truncado ? `<p class="mtr-aviso">Limite de eventos por consulta atingido — os números podem estar incompletos. Hora de mover a agregação para SQL.</p>` : ""}

      <h2 class="mtr-h2 top">Demanda não atendida</h2>
      <p class="mtr-sub">Buscas que retornaram <strong>zero</strong> resultado, por serviço + bairro. Ordenado por sessões distintas. Cada linha aqui é oferta faltando.</p>
      ${tabelaDemanda(m.demandaNaoAtendida)}

      <h2 class="mtr-h2">Totais</h2>
      <div class="mtr-grid">
        <div class="mtr-card"><div class="n" style="font-variant-numeric:tabular-nums">${m.buscasEventos}</div><div class="l">buscas (eventos)</div></div>
        <div class="mtr-card"><div class="n" style="font-variant-numeric:tabular-nums">${m.buscasUnicas}</div><div class="l">buscas únicas / sessão</div></div>
        <div class="mtr-card alerta"><div class="n" style="font-variant-numeric:tabular-nums">${m.buscasUnicasZero}</div><div class="l">buscas únicas c/ 0 resultado</div></div>
        <div class="mtr-card"><div class="n" style="font-variant-numeric:tabular-nums">${m.perfisVistos}</div><div class="l">perfis vistos</div></div>
        <div class="mtr-card"><div class="n" style="font-variant-numeric:tabular-nums">${m.cliquesTotal}</div><div class="l">cliques WhatsApp (total)</div></div>
      </div>

      <h2 class="mtr-h2">Taxas</h2>
      <div class="mtr-grid">
        <div class="mtr-card"><div class="n">${pct(m.taxaBuscaPerfil)}</div><div class="l">busca → perfil<br><span style="text-transform:none;letter-spacing:0">(sobre buscas únicas)</span></div></div>
        <div class="mtr-card"><div class="n">${pct(m.taxaPerfilWhats)}</div><div class="l">perfil → WhatsApp</div></div>
        <div class="mtr-card alerta"><div class="n">${pct(m.pctZeroUnica)}</div><div class="l">% buscas únicas s/ resultado</div></div>
        <div class="mtr-card"><div class="n">${pct(m.pctZeroEventos)}</div><div class="l">% buscas-evento s/ resultado</div></div>
      </div>
      <div class="mtr-grid">
        <div class="mtr-card"><div class="n" style="font-variant-numeric:tabular-nums">${m.cliquesCard}</div><div class="l">cliques WhatsApp · card da busca</div></div>
        <div class="mtr-card"><div class="n" style="font-variant-numeric:tabular-nums">${m.cliquesPerfil}</div><div class="l">cliques WhatsApp · página do perfil</div></div>
        <div class="mtr-card"><div class="n" style="font-variant-numeric:tabular-nums">${m.cliquesTotal}</div><div class="l">cliques WhatsApp · total</div></div>
      </div>

      <h2 class="mtr-h2">Demanda atendida</h2>
      <p class="mtr-sub">Buscas com resultado, por serviço + bairro.</p>
      ${tabelaDemanda(m.demandaAtendida)}

      <h2 class="mtr-h2">Profissionais publicados</h2>
      <p class="mtr-sub">Ordenado por cliques total (asc) — quem está recebendo zero contato aparece primeiro.</p>
      ${profs}

      <h2 class="mtr-h2">Origem</h2>
      <p class="mtr-sub">Eventos por utm_source + utm_campaign (atribuição first-touch).</p>
      ${origens}
    </div>
  `;

  return paginaSite({ titulo: "Métricas do diretório", secoes, cssExtra: CSS_ADMIN });
}

diretorioAdminRouter.get("/metricas", async (req, res) => {
  const chave = typeof req.query.chave === "string" ? req.query.chave : "";
  if (!chaveValida(chave)) return res.sendStatus(404);

  const periodo: "7d" | "30d" = req.query.periodo === "7d" ? "7d" : "30d";
  const dias = periodo === "7d" ? 7 : 30;
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [{ eventos, truncado }, publicados] = await Promise.all([
      buscarEventosPeriodo(desde),
      buscarPerfisPublicados({}),
    ]);
    const m = calcularMetricas(
      eventos,
      publicados.map((p) => ({ slug: p.slug, nome: p.nome, categoria: p.categoria }))
    );
    res.send(renderMetricas(m, chave, periodo, truncado));
  } catch (erro) {
    console.error("Erro ao montar métricas:", erro);
    res.status(500).send(
      paginaSite({
        titulo: "Métricas do diretório",
        secoes: `<div class="adminwrap"><h1>Métricas</h1><p class="lead">Não foi possível carregar agora. Tente de novo.</p></div>`,
        cssExtra: CSS_ADMIN,
      })
    );
  }
});

diretorioAdminRouter.get("/", async (req, res) => {
  const chave = typeof req.query.chave === "string" ? req.query.chave : "";
  if (!chaveValida(chave)) return res.sendStatus(404);

  const perfis = await listarPerfisAdmin().catch((erro) => {
    console.error("Erro ao listar perfis no admin:", erro);
    return [] as Awaited<ReturnType<typeof listarPerfisAdmin>>;
  });

  res.send(render(perfis, chave));
});

diretorioAdminRouter.post("/publicar", async (req, res) => {
  const chave = typeof req.body?.chave === "string" ? req.body.chave : "";
  if (!chaveValida(chave)) return res.sendStatus(404);

  const id = typeof req.body?.id === "string" ? req.body.id : "";
  const publicado = req.body?.publicado === "1";
  if (!id) return res.redirect(303, `/admin?chave=${encodeURIComponent(chave)}`);

  await definirPublicado(id, publicado).catch((erro) => console.error("Erro ao alterar publicado:", erro));
  res.redirect(303, `/admin?chave=${encodeURIComponent(chave)}`);
});

diretorioAdminRouter.post("/verificar", async (req, res) => {
  const chave = typeof req.body?.chave === "string" ? req.body.chave : "";
  if (!chaveValida(chave)) return res.sendStatus(404);

  const id = typeof req.body?.id === "string" ? req.body.id : "";
  const verificado = req.body?.verificado === "1";
  if (!id) return res.redirect(303, `/admin?chave=${encodeURIComponent(chave)}`);

  await definirVerificado(id, verificado).catch((erro) => console.error("Erro ao alterar verificado:", erro));
  res.redirect(303, `/admin?chave=${encodeURIComponent(chave)}`);
});
