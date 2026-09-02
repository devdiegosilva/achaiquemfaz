import { Router } from "express";
import { paginaSite, escaparHtml } from "../services/html";
import { listarPerfisAdmin, definirPublicado } from "../services/supabase";
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
  table.adm-t { border-collapse: collapse; width: 100%; font-size: 0.88rem; min-width: 760px; }
  table.adm-t th, table.adm-t td { border-bottom: 1px solid var(--border); padding: 10px 12px; text-align: left; vertical-align: top; }
  table.adm-t th { font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-subtle); background: var(--surface-2); }
  table.adm-t tbody tr:last-child td { border-bottom: none; }
  table.adm-t tbody tr:hover td { background: var(--surface-2); }
  table.adm-t td.mono { font-family: var(--font-mono); font-size: 0.74rem; word-break: break-all; max-width: 300px; color: var(--text-muted); }
  .st { display: inline-block; font-family: var(--font-mono); font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.03em; padding: 3px 8px; border-radius: var(--r-pill); }
  .st.on { background: var(--success-weak); color: var(--success); border: 1px solid var(--success); }
  .st.off { border: 1px solid var(--border-strong); color: var(--text-subtle); }
  form.inline { display: inline; }
  form.inline button { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; padding: 5px 10px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); cursor: pointer; border-radius: var(--r-sm); }
  form.inline button:hover { background: var(--surface-3); }
  .adm-ver { font-family: var(--font-mono); font-size: 0.72rem; margin-left: 6px; }
`;

function render(perfis: Awaited<ReturnType<typeof listarPerfisAdmin>>, chave: string): string {
  const total = perfis.length;
  const publicados = perfis.filter((p) => p.publicado).length;

  const linhas = perfis
    .map((p) => {
      const linkEdicao = `${env.backendPublicUrl}/diretorio/editar?token=${p.edit_token}`;
      const convite = `Oi! O Achaí Quem Faz agora tem uma vitrine online de profissionais para casa e condomínio em João Pessoa. Quer que a gente publique seu perfil? É grátis. Confira e complete seus dados: ${linkEdicao}`;
      return `
      <tr>
        <td>${escaparHtml(p.nome)}<br /><span style="color:var(--text-subtle);font-size:0.8rem">${escaparHtml(p.categoria)}</span></td>
        <td style="font-family:var(--font-mono);font-size:0.8rem">${escaparHtml(p.whatsapp)}</td>
        <td>${p.publicado ? '<span class="st on">no ar</span>' : '<span class="st off">oculto</span>'}</td>
        <td>
          <form class="inline" method="POST" action="/diretorio/admin/publicar">
            <input type="hidden" name="chave" value="${escaparHtml(chave)}" />
            <input type="hidden" name="id" value="${escaparHtml(p.id)}" />
            <input type="hidden" name="publicado" value="${p.publicado ? "0" : "1"}" />
            <button type="submit">${p.publicado ? "Ocultar" : "Publicar"}</button>
          </form>
          ${p.publicado ? `<a class="adm-ver" href="/diretorio/p/${escaparHtml(p.slug)}" target="_blank" rel="noopener">ver</a>` : ""}
        </td>
        <td class="mono">${escaparHtml(linkEdicao)}</td>
        <td class="mono">${escaparHtml(convite)}</td>
      </tr>`;
    })
    .join("");

  const secoes = `
    <div class="adminwrap">
      <h1>Painel do diretório</h1>
      <p class="lead">${publicados} de ${total} ${total === 1 ? "perfil" : "perfis"} no ar. O link de edição de cada profissional é pessoal — envie só para ele.</p>
      <div class="adm">
        <table class="adm-t">
          <thead>
            <tr><th>Nome</th><th>WhatsApp</th><th>Status</th><th>Ação</th><th>Link de edição</th><th>Mensagem de convite</th></tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    </div>
  `;

  return paginaSite({ titulo: "Painel do diretório", secoes, cssExtra: CSS_ADMIN });
}

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
  if (!id) return res.redirect(303, `/diretorio/admin?chave=${encodeURIComponent(chave)}`);

  await definirPublicado(id, publicado).catch((erro) => console.error("Erro ao alterar publicado:", erro));
  res.redirect(303, `/diretorio/admin?chave=${encodeURIComponent(chave)}`);
});
