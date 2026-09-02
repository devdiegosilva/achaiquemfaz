import { CATEGORIAS_CASA_CONDOMINIO, SEGMENTOS } from "../types";
import { escaparHtml } from "./html";

// CSS compartilhado pelos formulários do diretório (cadastro e edição via magic link).
export const CSS_FORM_DIRETORIO = `
  form label { display: block; margin-top: 20px; margin-bottom: 6px; font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); }
  form input[type=text], form input[type=email], form input[type=tel], form textarea, form select {
    width: 100%; padding: 11px 12px; border: 1px solid var(--line-strong); background: var(--paper-alt);
    color: var(--ink); font-family: var(--font-body); font-size: 1rem; border-radius: 2px; box-sizing: border-box;
  }
  form textarea { min-height: 120px; resize: vertical; }
  form input:focus, form select:focus, form textarea:focus { outline: 2px solid var(--work); outline-offset: 1px; }
  .campo-tel { display: flex; gap: 8px; }
  .campo-tel .ddi { padding: 11px 12px; border: 1px solid var(--line-strong); background: var(--paper-alt); color: var(--ink-muted); font-family: var(--font-mono); border-radius: 2px; }
  .campo-tel input { flex: 1; }
  .ajuda { font-size: 0.85rem; color: var(--ink-muted); margin: 6px 0 0; }
  .erro { font-family: var(--font-mono); font-size: 0.85rem; color: var(--stamp); border: 1px dashed var(--stamp); padding: 10px 12px; margin: 0 0 8px; }
  .checks { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; }
  .checks label { display: inline-flex; align-items: center; gap: 8px; margin: 0; text-transform: none; letter-spacing: 0; font-family: var(--font-body); font-size: 1rem; color: var(--ink); }
  .checks input { width: auto; }
  .publicar-box { border: 1.5px solid var(--work); padding: 14px 16px; margin-top: 26px; display: flex; gap: 10px; align-items: flex-start; }
  .publicar-box input { width: auto; margin-top: 4px; }
  .publicar-box label { margin: 0; text-transform: none; letter-spacing: 0; font-family: var(--font-body); font-size: 1rem; color: var(--ink); }
  form .stamp-btn { width: 100%; text-align: center; margin-top: 30px; border: none; background: var(--work); color: var(--stamp-ink); cursor: pointer; transform: none; }
  form .stamp-btn::after { display: none; }
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

// Checkboxes de segmento (casa / condomínio).
export function checkboxesSegmento(marcados: string[]): string {
  return Object.keys(SEGMENTOS)
    .map(
      (s) =>
        `<label><input type="checkbox" name="segmentos" value="${s}"${
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
