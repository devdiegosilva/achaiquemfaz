import axios from "axios";
import { env } from "../config/env";

const client = axios.create({
  baseURL: env.asaasApiUrl,
  headers: { access_token: env.asaasApiKey, "Content-Type": "application/json" },
});

function amanha(): string {
  const data = new Date();
  data.setDate(data.getDate() + 1);
  return data.toISOString().slice(0, 10);
}

export async function criarCheckoutAssinatura(params: {
  nome: string;
  cpfCnpj: string;
  email: string;
  fornecedorId: string;
}): Promise<{ link: string; checkoutId: string }> {
  const { data } = await client.post("/checkouts", {
    // Asaas só permite cartão de crédito para checkouts de assinatura (chargeTypes RECURRENT);
    // Pix exige chargeTypes DETACHED (cobrança avulsa), então fica de fora por enquanto.
    billingTypes: ["CREDIT_CARD"],
    chargeTypes: ["RECURRENT"],
    externalReference: params.fornecedorId,
    callback: {
      successUrl: `${env.backendPublicUrl}/cadastro/sucesso`,
      cancelUrl: `${env.backendPublicUrl}/cadastro/cancelado`,
      expiredUrl: `${env.backendPublicUrl}/cadastro/expirado`,
    },
    items: [{ name: "Assinatura Ache Fornecedores", quantity: 1, value: env.assinaturaValorMensal }],
    customerData: {
      name: params.nome,
      cpfCnpj: params.cpfCnpj,
      email: params.email,
    },
    subscription: {
      cycle: "MONTHLY",
      nextDueDate: amanha(),
    },
  });

  return { link: data.link as string, checkoutId: data.id as string };
}
