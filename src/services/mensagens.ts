type TemplateFornecedor = (nomeDemandante: string, bairroTexto: string, telefoneDemandante: string) => string;

const TEMPLATES_FORNECEDOR: TemplateFornecedor[] = [
  (nome, bairro, telefone) =>
    `Nós da Ache Fornecedores encontramos uma nova demanda pra você! ${nome} está à procura dos seus serviços${bairro}. Entre em contato pelo WhatsApp ${telefone}.`,
  (nome, bairro, telefone) =>
    `A Ache Fornecedores tem um cliente esperando por você: ${nome} precisa dos seus serviços${bairro}. Fale com ele pelo WhatsApp ${telefone}.`,
  (nome, bairro, telefone) =>
    `Mais uma oportunidade chegou pela Ache Fornecedores! ${nome} está buscando um profissional como você${bairro}. Contato: WhatsApp ${telefone}.`,
  (nome, bairro, telefone) =>
    `Chegou demanda nova pela Ache Fornecedores: ${nome} precisa de ajuda com seus serviços${bairro}. Chama no WhatsApp ${telefone}.`,
  (nome, bairro, telefone) =>
    `Aqui é a Ache Fornecedores! Temos um novo pedido pra você: ${nome} está procurando seus serviços${bairro}. Entre em contato pelo WhatsApp ${telefone}.`,
];

export function montarMensagemFornecedor(nomeDemandante: string, bairroTexto: string, telefoneDemandante: string): string {
  const template = TEMPLATES_FORNECEDOR[Math.floor(Math.random() * TEMPLATES_FORNECEDOR.length)];
  return template(nomeDemandante, bairroTexto, telefoneDemandante);
}
