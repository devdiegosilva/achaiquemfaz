-- Normaliza categorias digitadas à mão ("Não encontrei minha categoria") para as
-- chaves canônicas da lista, pra os perfis ficarem lincados aos cards da home e ao
-- filtro da busca. Rode uma vez no SQL editor do Supabase.
--
-- Contexto: os primeiros perfis foram cadastrados com texto livre ("frete" em vez de
-- "frete e mudança", "cortina de vidro" em vez de "vidraceiro" etc). A partir de agora
-- o cadastro já faz essa normalização sozinho (src/services/categorias.ts).

-- Mapeamentos diretos (sem ambiguidade):
update fornecedores set categoria = 'frete e mudança'          where lower(categoria) = 'frete';
update fornecedores set categoria = 'vidraceiro'               where lower(categoria) in ('cortina de vidro', 'porta de vidro', 'box de vidro');
update fornecedores set categoria = 'técnico em eletrodomésticos' where lower(categoria) in ('máquinas de lavar', 'maquinas de lavar', 'máquina de lavar');
update fornecedores set categoria = 'encanador'                where lower(categoria) in ('sistema hidráulico', 'sistema hidraulico', 'hidráulica', 'hidraulica');

-- Ambíguos — revise antes de rodar (descomente o que fizer sentido):
-- "eletrica e hidraulica": é eletricista + encanador. Escolha o principal:
-- update fornecedores set categoria = 'eletricista' where lower(categoria) = 'eletrica e hidraulica';
-- "pedreiro/pintor": dois ofícios. Escolha o principal:
-- update fornecedores set categoria = 'pedreiro' where lower(categoria) = 'pedreiro/pintor';

-- Confira o resultado:
-- select categoria, count(*) from fornecedores where publicado group by categoria order by categoria;
