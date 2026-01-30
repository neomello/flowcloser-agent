import { Router } from "express";
import {
    verifyMetaClientCertificate,
    verifyMetaWebhookSignature,
    sendMetaMessage,
    sendWhatsAppTextMessage
} from "../services/meta.js";
import { getAccountByPageId, getDefaultAccount } from "../config/accounts.js";
import { askWithFallback } from "../agents/flowcloser/agent.js";
import { extractLeadDataFromMessage, computeLeadScore, recordLeadInteraction } from "../services/leads.js";

const router = Router();
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "flowcloser_webhook_neo";

// Verificação Webhook (Instagram)
router.get("/instagram", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Receber Webhook (Instagram)
router.post("/instagram", async (req, res) => {
    try {
        const body = req.body;
        if (body.object === "instagram" || body.object === "page") {
            body.entry?.forEach((entry: any) => {
                entry.messaging?.forEach(async (event: any) => {
                    if (event.message?.text) {
                        const senderId = event.sender.id;
                        const messageText = event.message.text;
                        const rawPageId = event.recipient?.id || entry.id;
                        const account = getAccountByPageId(rawPageId) || getDefaultAccount(body.object === "page" ? "messenger" : "instagram");

                        const responseText = await askWithFallback(messageText, {
                            channel: account?.platform || "instagram",
                            userId: senderId,
                            context: { pageId: rawPageId, accountName: account?.account_name },
                        });

                        await sendMetaMessage(account, senderId, responseText);

                        const leadData = extractLeadDataFromMessage(messageText);
                        const score = computeLeadScore(leadData);
                        await recordLeadInteraction({
                            user_platform_id: senderId,
                            page_id: rawPageId,
                            platform: account?.platform || "instagram",
                            account_name: account?.account_name || "unknown",
                            ...leadData,
                            score,
                            qualified: score >= 60,
                        });
                    }
                });
            });
            res.status(200).send("EVENT_RECEIVED");
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        res.sendStatus(500);
    }
});

// WhatsApp Webhook (Meta)
router.get("/whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

router.post("/whatsapp", async (req, res) => {
    try {
        if (!verifyMetaWebhookSignature(req)) return res.sendStatus(403);
        const body = req.body;
        // Processar mensagens do WhatsApp Cloud API...
        // (Simplificado para o exemplo, manter a lógica do main.ts original)
        res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
        res.sendStatus(500);
    }
});

export default router;
