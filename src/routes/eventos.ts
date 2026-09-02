import express, { Router } from "express";
import { registrarEvento, podeRegistrar, pareceBot } from "../services/eventos";

export const eventosRouter = Router();

// O client manda o corpo como text/plain (sendBeacon sempre; fetch por padrão quando
// não seta Content-Type). Parser tolerante, escopado a esta rota.
eventosRouter.use(express.text({ type: "text/plain", limit: "16kb" }));

eventosRouter.post("/eventos", (req, res) => {
  // Sempre 204, rápido. O registro é fire-and-forget.
  res.status(204).end();

  try {
    const ip = req.ip ?? "";
    if (!podeRegistrar(ip)) return;

    const ua = req.headers["user-agent"] ?? "";
    if (pareceBot(ua)) return;

    // Anti-lixo leve: se veio header Origin, precisa ser do próprio site.
    const origin = req.headers.origin;
    if (origin && !origin.includes("achaiquemfaz.com.br") && !origin.includes("localhost")) return;

    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
    let payload: unknown;
    try {
      payload = JSON.parse(raw || "{}");
    } catch {
      return;
    }

    void registrarEvento(payload, ua);
  } catch (e) {
    console.error("POST /api/eventos:", e);
  }
});
