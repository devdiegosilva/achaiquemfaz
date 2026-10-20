import { Router } from "express";
import { paginaSite } from "../services/html";
import { CSS_FORM_DIRETORIO } from "../services/diretorioCampos";

export const suporteRouter = Router();

const EMAIL_SUPORTE = "achaiquemfaz@gmail.com";

// mailto com assunto/corpo pré-preenchidos, pra abrir o app de e-mail do usuário já
// pronto pra escrever. Sem backend de envio — MVP: o próprio cliente de e-mail do
// usuário manda a mensagem.
function linkEmailSuporte(): string {
  const assunto = encodeURIComponent("Suporte - Achaí Quem Faz");
  const corpo = encodeURIComponent("Olá! Preciso de ajuda com:\n\n\n\n---\nNome:\nWhatsApp (opcional):");
  return `mailto:${EMAIL_SUPORTE}?subject=${assunto}&body=${corpo}`;
}

suporteRouter.get("/", (_req, res) => {
  const secoes = `
    <div class="formwrap" style="text-align:center;padding-top:48px">
      <h1>Precisa de ajuda?</h1>
      <p class="lead" style="margin:0 auto 28px;max-width:46ch">Conta pra gente o que está acontecendo. A gente responde assim que possível.</p>
      <a class="btn btn-primary btn-lg" href="${linkEmailSuporte()}">Enviar e-mail</a>
      <p style="margin-top:18px;font-size:0.85rem;color:var(--text-subtle)">Se o botão não abrir seu aplicativo de e-mail, escreva direto para <strong>${EMAIL_SUPORTE}</strong>.</p>
    </div>
  `;

  res.send(
    paginaSite({
      titulo: "Suporte",
      secoes,
      cssExtra: CSS_FORM_DIRETORIO,
      largura: "estreita",
      metaDescricao: "Precisa de ajuda com o Achaí Quem Faz? Fale com a gente por e-mail.",
    })
  );
});
