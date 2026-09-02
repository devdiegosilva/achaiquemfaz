// Gera um slug de URL a partir de um texto livre (nome do prestador).
// Ex: "José da Silva — Elétrica" -> "jose-da-silva-eletrica"
export function gerarSlug(texto: string): string {
  const semAcento = texto
    .normalize("NFD")
    // Remove os sinais diacríticos (combining marks, U+0300–U+036F) que o NFD separou.
    .split("")
    .filter((c) => {
      const code = c.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join("");

  const base = semAcento
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return base || "prestador";
}

// Sufixo curto para desambiguar slugs repetidos (ex: dois "joao-eletricista").
export function sufixoAleatorio(tamanho = 4): string {
  return Math.random().toString(36).slice(2, 2 + tamanho);
}
