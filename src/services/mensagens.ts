import { env } from "../config/env";

type TemplateFornecedor = (nomeDemandante: string, bairroTexto: string, telefoneDemandante: string) => string;

const TEMPLATES_FORNECEDOR: TemplateFornecedor[] = [
  (nome, bairro, telefone) =>
    `Nós da Achaí Quem Faz encontramos uma nova demanda pra você! ${nome} está à procura dos seus serviços${bairro}. Entre em contato pelo WhatsApp ${telefone}.`,
  (nome, bairro, telefone) =>
    `A Achaí Quem Faz tem um cliente esperando por você: ${nome} precisa dos seus serviços${bairro}. Fale com ele pelo WhatsApp ${telefone}.`,
  (nome, bairro, telefone) =>
    `Mais uma oportunidade chegou pela Achaí Quem Faz! ${nome} está buscando um profissional como você${bairro}. Contato: WhatsApp ${telefone}.`,
  (nome, bairro, telefone) =>
    `Chegou demanda nova pela Achaí Quem Faz: ${nome} precisa de ajuda com seus serviços${bairro}. Chama no WhatsApp ${telefone}.`,
  (nome, bairro, telefone) =>
    `Aqui é a Achaí Quem Faz! Temos um novo pedido pra você: ${nome} está procurando seus serviços${bairro}. Entre em contato pelo WhatsApp ${telefone}.`,
];

export function montarMensagemFornecedor(
  nomeDemandante: string,
  bairroTexto: string,
  telefoneDemandante: string,
  isTrial: boolean
): string {
  // Exibe o contato do demandante com "+" antes do código do país (ex: +5583999999999) —
  // internamente o número segue sem "+" (formato do JID do WhatsApp), só o texto exibido muda.
  const telefoneFormatado = telefoneDemandante.startsWith("+") ? telefoneDemandante : `+${telefoneDemandante}`;

  const template = TEMPLATES_FORNECEDOR[Math.floor(Math.random() * TEMPLATES_FORNECEDOR.length)];
  const mensagem = template(nomeDemandante, bairroTexto, telefoneFormatado);

  if (!isTrial) return mensagem;

  return `${mensagem}\n\nVocê recebeu esta demanda da Achaí Quem Faz. Para receber mais indicações como esta, acesse ${env.backendPublicUrl}/cadastro e confira nossos planos disponíveis.`;
}
