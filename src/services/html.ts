export function paginaBase(titulo: string, corpo: string, cssExtra = ""): string {
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
  button, a.cta { margin-top: 24px; display: inline-block; text-align: center; width: 100%; padding: 12px; border-radius: 6px; border: none; background: #22c55e; color: #08130b; font-weight: bold; font-size: 1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; }
  .msg { text-align: center; margin-top: 60px; }
  .erro { color: #f87171; margin-top: 16px; }
  ${cssExtra}
</style>
</head>
<body>
<div class="container">${corpo}</div>
</body>
</html>`;
}
