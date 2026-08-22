import { Router } from "express";
import { env } from "../config/env";
import {
  ativarFornecedorPorId,
  ativarFornecedorPorAsaasCustomerId,
  desativarFornecedorPorAsaasCustomerId,
} from "../services/supabase";

export const webhookPagamentoRouter = Router();

async function ativarPorReferenciaOuCliente(
  fornecedorId: string | undefined,
  asaasCustomerId: string | undefined,
  origem: string
): Promise<void> {
  let ativado = false;
  if (fornecedorId && asaasCustomerId) {
    ativado = await ativarFornecedorPorId(fornecedorId, asaasCustomerId);
  }
  if (!ativado && asaasCustomerId) {
    ativado = await ativarFornecedorPorAsaasCustomerId(asaasCustomerId);
  }
  if (!ativado) {
    console.error(`Webhook de ${origem} sem fornecedor correspondente:`, { fornecedorId, asaasCustomerId });
  }
}

webhookPagamentoRouter.post("/pagamento", async (req, res) => {
  const tokenRecebido = req.header("asaas-access-token");
  if (tokenRecebido !== env.asaasWebhookToken) {
    return res.sendStatus(401);
  }

  try {
    const { event, payment, checkout } = req.body ?? {};

    // Primeira cobrança da assinatura: a Asaas confirma o pagamento pelo evento do
    // Checkout (CHECKOUT_PAID), não pelo evento padrão de cobrança.
    if (event === "CHECKOUT_PAID" && checkout) {
      await ativarPorReferenciaOuCliente(checkout.externalReference, checkout.customer, "checkout pago");
    }

    // Renovações seguintes da assinatura chegam pelos eventos padrão de cobrança.
    if (event === "PAYMENT_CONFIRMED" && payment) {
      await ativarPorReferenciaOuCliente(payment.externalReference, payment.customer, "pagamento confirmado");
    }

    if (event === "PAYMENT_OVERDUE" && payment?.customer) {
      const desativado = await desativarFornecedorPorAsaasCustomerId(payment.customer);
      if (!desativado) {
        console.error("Webhook de cobrança vencida sem fornecedor correspondente:", { asaasCustomerId: payment.customer });
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao processar webhook de pagamento:", error);
    return res.sendStatus(500);
  }
});
