import { createHmac, timingSafeEqual } from "node:crypto";
import express from "express";
import twilio from "twilio";
import { MetaAccountConfig } from "../config/accounts.js";

/**
 * Verifica certificado de cliente do Meta (se disponível)
 */
export function verifyMetaClientCertificate(req: express.Request): boolean {
    const clientCert = req.headers["x-client-certificate"] ||
        req.headers["x-amzn-mtls-clientcert-subject"] ||
        process.env.META_CLIENT_CERT_CN;

    if (clientCert) {
        const cnMatch = String(clientCert).includes("client.webhooks.fbclientcerts.com");
        if (!cnMatch) {
            console.warn("⚠️ Client certificate CN mismatch:", clientCert);
            return false;
        }
        console.log("✅ Client certificate verified");
        return true;
    }
    return true;
}

/**
 * Verifica assinatura do webhook (Instagram/WhatsApp)
 */
export function verifyMetaWebhookSignature(req: express.Request): boolean {
    const appSecret =
        process.env.META_APP_SECRET ||
        process.env.INSTAGRAM_APP_SECRET ||
        process.env.FACEBOOK_APP_SECRET;

    if (!appSecret) return true;

    const signatureHeader = req.headers["x-hub-signature-256"];
    if (!signatureHeader || Array.isArray(signatureHeader)) return false;

    const rawBody: Buffer | undefined = (req as any).rawBody;
    if (!rawBody) return false;

    const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");

    try {
        return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
    } catch {
        return false;
    }
}

/**
 * Envia mensagem via Instagram/Messenger Graph API
 */
export async function sendMetaMessage(
    account: MetaAccountConfig | null,
    recipientId: string,
    messageText: string,
    pageId?: string,
): Promise<void> {
    const accessToken = account?.page_access_token || process.env.INSTAGRAM_ACCESS_TOKEN;
    const resolvedPageId = pageId || account?.page_id || process.env.INSTAGRAM_PAGE_ID || "me";

    if (!accessToken) {
        console.warn("⚠️ Nenhum access token configurado para enviar mensagem");
        return;
    }

    try {
        const url = `https://graph.facebook.com/v18.0/${resolvedPageId}/messages?access_token=${accessToken}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messaging_type: "RESPONSE",
                recipient: { id: recipientId },
                message: { text: messageText },
            }),
        });

        const data = (await response.json()) as any;
        if (data.error) {
            const { ExternalAPIError } = await import("../utils/errors.js");
            throw new ExternalAPIError("Erro ao enviar mensagem Instagram", { metaError: data.error });
        } else {
            console.log(`✅ Mensagem enviada para ${recipientId} via ${account?.account_name || resolvedPageId}`);
        }
    } catch (error) {
        console.error("❌ Erro ao enviar mensagem Instagram:", error);
    }
}

/**
 * Envia mensagem via WhatsApp Cloud API (Meta)
 */
export async function sendMetaWhatsAppMessage(to: string, body: string): Promise<void> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
        console.warn("⚠️ WhatsApp Meta não configurado");
        return;
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: { body, preview_url: false },
            }),
        });

        const data = (await response.json()) as any;
        if (!response.ok) {
            console.error("❌ Erro ao enviar WhatsApp Meta:", data?.error || data);
            return;
        }
        console.log("✅ WhatsApp Meta enviado");
    } catch (error) {
        console.error("❌ Erro ao enviar WhatsApp Meta:", error);
    }
}

/**
 * Envia mensagem via Twilio WhatsApp
 */
export async function sendTwilioWhatsAppMessage(to: string, body: string): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !fromNumber) return;

    try {
        const client = twilio(accountSid, authToken);
        const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
        const fromFormatted = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;

        await client.messages.create({ from: fromFormatted, to: toFormatted, body: body });
        console.log(`✅ WhatsApp Twilio enviado`);
    } catch (error) {
        console.error("❌ Erro ao enviar WhatsApp via Twilio:", error);
    }
}

/**
 * Envia mensagem via WhatsApp (Detecta provedor)
 */
export async function sendWhatsAppTextMessage(to: string, body: string): Promise<void> {
    const provider = process.env.WHATSAPP_PROVIDER || "meta";

    if (provider === "twilio" && process.env.TWILIO_ACCOUNT_SID) {
        await sendTwilioWhatsAppMessage(to, body);
    } else {
        await sendMetaWhatsAppMessage(to, body);
    }
}
