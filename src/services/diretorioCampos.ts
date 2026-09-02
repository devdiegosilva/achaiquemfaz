import { CATEGORIAS_CASA_CONDOMINIO, SEGMENTOS } from "../types";
import { escaparHtml } from "./html";

// CSS compartilhado pelos formulários do diretório (cadastro em etapas e edição via magic link).
// Usa o design system do diretório (tokens de CSS_SITE em html.ts).
export const CSS_FORM_DIRETORIO = `
  .formwrap { padding: 30px clamp(16px, 4vw, 32px) 48px; }
  .formwrap h1 { font-family: var(--font-head); font-weight: 800; font-size: 1.6rem; margin: 0 0 4px; }
  .formwrap .lead { color: var(--text-muted); font-size: 0.95rem; margin: 0 0 24px; }

  .fld { margin-bottom: 16px; }
  .fld > label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
  .fld input[type=text], .fld input[type=email], .fld input[type=tel], .fld textarea, .fld select {
    width: 100%; border: 1px solid var(--border-strong); border-radius: var(--r-sm); padding: 10px 12px;
    font-family: inherit; font-size: 0.95rem; color: var(--text); background: var(--surface);
  }
  .fld textarea { min-height: 104px; resize: vertical; }
  .fld input:focus, .fld textarea:focus, .fld select:focus { outline: 2px solid var(--primary); outline-offset: 0; border-color: var(--primary); }
  .fld input:disabled { background: var(--surface-2); color: var(--text-subtle); }
  .fld .hint { font-size: 0.82rem; color: var(--text-subtle); margin: 6px 0 0; }

  .campo-tel { display: flex; }
  .campo-tel .ddi { display: flex; align-items: center; padding: 0 12px; border: 1px solid var(--border-strong); border-right: none; border-radius: var(--r-sm) 0 0 var(--r-sm); background: var(--surface-2); color: var(--text-muted); font-family: var(--font-mono); font-size: 0.9rem; }
  .campo-tel input { border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important; }

  .chk-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .chk { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--border-strong); border-radius: var(--r-pill); padding: 8px 15px; font-size: 0.9rem; color: var(--text-muted); cursor: pointer; }
  .chk input { accent-color: var(--primary); }

  .form-erro { background: var(--error-weak); border: 1px solid var(--error); color: var(--error); border-radius: var(--r-sm); padding: 11px 14px; font-size: 0.9rem; margin-bottom: 18px; }
  .form-ok { background: var(--success-weak); border: 1px solid var(--success); color: var(--success); border-radius: var(--r-sm); padding: 11px 14px; font-size: 0.9rem; margin-bottom: 18px; }

  .publicar-box { border: 1px solid var(--primary); background: var(--primary-weak); border-radius: var(--r-md); padding: 14px 16px; margin-top: 24px; display: flex; gap: 10px; align-items: flex-start; }
  .publicar-box input { margin-top: 3px; accent-color: var(--primary); }
  .publicar-box label { font-size: 0.92rem; color: var(--text); }

  .linkbox { border: 1px solid var(--border-strong); background: var(--surface-2); border-radius: var(--r-sm); padding: 12px 14px; font-family: var(--font-mono); font-size: 0.82rem; word-break: break-all; margin: 10px 0 18px; }

  /* cadastro em etapas */
  .wiz-head[hidden], .wiz-nav[hidden] { display: none; }
  .wiz-bar { display: flex; gap: 6px; margin-bottom: 10px; }
  .wiz-bar span { flex: 1; height: 4px; border-radius: 2px; background: var(--surface-3); }
  .wiz-bar span.done { background: var(--primary); }
  .wiz-stepnum { font-family: var(--font-mono); font-size: 0.74rem; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 18px; }
  .wstep h2 { font-family: var(--font-head); font-size: 1.28rem; font-weight: 700; margin: 0 0 4px; }
  .wstep .stepdesc { color: var(--text-muted); font-size: 0.9rem; margin: 0 0 20px; }
  .wiz.js .wstep[hidden] { display: none; }
  .wiz-nav { display: flex; justify-content: space-between; gap: 10px; margin-top: 26px; }
  .wiz-resumo { display: grid; gap: 0; margin: 4px 0 18px; }
  .wiz-resumo > div { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--border); padding: 9px 0; font-size: 0.92rem; }
  .wiz-resumo dt { color: var(--text-subtle); margin: 0; }
  .wiz-resumo dd { margin: 0; color: var(--text); font-weight: 500; text-align: right; }
`;

// Lista de <option> de categorias (foco casa e condomínio). Inclui a categoria atual
// mesmo que ela não esteja na lista base (ex: cadastro antigo com categoria "outro").
export function opcoesCategoria(atual: string): string {
  const chaves = Object.keys(CATEGORIAS_CASA_CONDOMINIO);
  const opcoes = chaves.map(
    (c) =>
      `<option value="${escaparHtml(c)}"${c === atual ? " selected" : ""}>${escaparHtml(CATEGORIAS_CASA_CONDOMINIO[c])}</option>`
  );
  if (atual && !chaves.includes(atual)) {
    opcoes.unshift(`<option value="${escaparHtml(atual)}" selected>${escaparHtml(atual)}</option>`);
  }
  return opcoes.join("");
}

// Checkboxes de segmento (casa / condomínio), no estilo "pill".
export function checkboxesSegmento(marcados: string[]): string {
  return Object.keys(SEGMENTOS)
    .map(
      (s) =>
        `<label class="chk"><input type="checkbox" name="segmentos" value="${s}"${
          marcados.includes(s) ? " checked" : ""
        } /> ${escaparHtml(SEGMENTOS[s])}</label>`
    )
    .join("");
}

// "Troca de lâmpada\nInstalação de chuveiro" -> ["Troca de lâmpada", "Instalação de chuveiro"]
export function parseServicos(texto: unknown): string[] {
  if (typeof texto !== "string") return [];
  return texto
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

// Normaliza o campo segmentos do body (pode vir string, array ou ausente).
export function parseSegmentos(valor: unknown): string[] {
  const validos = Object.keys(SEGMENTOS);
  const lista = Array.isArray(valor) ? valor : valor != null ? [valor] : [];
  const filtrados = lista.filter((s): s is string => typeof s === "string" && validos.includes(s));
  return filtrados.length ? Array.from(new Set(filtrados)) : ["casa", "condominio"];
}

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}
