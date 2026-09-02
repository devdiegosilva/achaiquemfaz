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
  .tabela-wrap { overflow-x: auto; margin-top: 8px; }
  table.admin { border-collapse: collapse; width: 100%; font-size: 0.9rem; }
  table.admin th, table.admin td { border: 1px solid var(--line-strong); padding: 8px 10px; text-align: left; vertical-align: top; }
  table.admin th { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); background: var(--paper-alt); }
  table.admin td.link { font-family: var(--font-mono); font-size: 0.78rem; word-break: break-all; max-width: 320px; }
  .tag { font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; padding: 2px 6px; border-radius: 2px; }
  .tag.on { background: var(--work); color: var(--stamp-ink); }
  .tag.off { border: 1px solid var(--line-strong); color: var(--ink-muted); }
  form.inline { display: inline; }
  form.inline button { font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; padding: 5px 8px; border: 1px solid var(--line-strong); background: var(--paper); cursor: pointer; border-radius: 2px; }
`;

function render(perfis: Awaited<ReturnType<typeof listarPerfisAdmin>>, chave: string): string {
  const total = perfis.length;
  const publicados = perfis.filter((p) => p.publicado).length;

  const linhas = perfis
    .map((p) => {
      const linkEdicao = `${env.backendPublicUrl}/diretorio/editar?token=${p.edit_token}`;
      const convite = `Oi! O Achaí Quem Faz agora tem uma vitrine online de prestadores para casa e condomínio em João Pessoa. Quer que a gente publique seu perfil? É grátis. Confira e complete seus dados: ${linkEdicao}`;
      return `
      <tr>
        <td>${escaparHtml(p.nome)}<br /><span style="color: var(--ink-muted); font-size: 0.8rem;">${escaparHtml(p.categoria)}</span></td>
        <td>${escaparHtml(p.whatsapp)}</td>
        <td>${p.publicado ? '<span class="tag on">no ar</span>' : '<span class="tag off">oculto</span>'}</td>
        <td>
          <form class="inline" method="POST" action="/diretorio/admin/publicar">
            <input type="hidden" name="chave" value="${escaparHtml(chave)}" />
            <input type="hidden" name="id" value="${escaparHtml(p.id)}" />
            <input type="hidden" name="publicado" value="${p.publicado ? "0" : "1"}" />
            <button type="submit">${p.publicado ? "Ocultar" : "Publicar"}</button>
          </form>
          ${p.publicado ? ` <a href="/diretorio/p/${escaparHtml(p.slug)}" target="_blank" rel="noopener">ver</a>` : ""}
        </td>
        <td class="link">${escaparHtml(linkEdicao)}</td>
        <td class="link">${escaparHtml(convite)}</td>
      </tr>`;
    })
    .join("");

  const secoes = `
    <section>
      <h1 style="max-width: none;">Painel do diretório</h1>
      <p class="lede">${publicados} de ${total} perfis no ar. O link de edição de cada prestador é pessoal — envie só para ele.</p>
      <div class="tabela-wrap">
        <table class="admin">
          <thead>
            <tr><th>Nome</th><th>WhatsApp</th><th>Status</th><th>Ação</th><th>Link de edição</th><th>Mensagem de convite</th></tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    </section>
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
