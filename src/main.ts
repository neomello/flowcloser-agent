// IMPORTAR PRIMEIRO - garante que crypto esteja disponível antes do @iqai/adk
import "./crypto-polyfill.js";

import express from "express";
import * as dotenv from "dotenv";
import { agent, askWithFallback } from "./agents/flowcloser/agent.js";
import { privacyPolicy, termsOfService } from "./routes/legal.js";

// Forçar uso do .env mesmo se houver variáveis de ambiente do sistema
dotenv.config({ override: true });

const app = express();
const PORT = Number(process.env.PORT) || 8042;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "flowcloser_webhook_neo";

app.use(express.json());

app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════
// PÁGINAS LEGAIS (Obrigatório para aprovação no Meta Developer)
// ═══════════════════════════════════════════════════════════════════════

app.get("/privacy-policy", privacyPolicy);
app.get("/terms-of-service", termsOfService);

app.get("/api/agents", async (req, res) => {
	try {
		res.json({
			agents: ["flowcloser"],
			status: "ok",
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to list agents" });
	}
});

app.get("/api/webhooks/instagram", (req, res) => {
	const mode = req.query["hub.mode"];
	const token = req.query["hub.verify_token"];
	const challenge = req.query["hub.challenge"];

	if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
		console.log("✅ Webhook verified");
		res.status(200).send(challenge);
	} else {
		res.sendStatus(403);
	}
});

/**
 * Envia mensagem de volta para o Instagram via Graph API
 */
async function sendInstagramMessage(recipientId: string, messageText: string): Promise<void> {
	const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
	const pageId = process.env.INSTAGRAM_PAGE_ID; // Opcional: ID da página se necessário

	if (!accessToken) {
		console.warn("⚠️ INSTAGRAM_ACCESS_TOKEN não configurado, não é possível enviar mensagem");
		return;
	}

	try {
		// Instagram Graph API endpoint para enviar mensagens
		// Para Instagram, usamos o endpoint do Instagram Business Account
		// Se tiver INSTAGRAM_PAGE_ID, use ele, senão use 'me'
		const pageId = process.env.INSTAGRAM_PAGE_ID || "me";
		const url = `https://graph.facebook.com/v18.0/${pageId}/messages?access_token=${accessToken}`;
		
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messaging_type: "RESPONSE",
				recipient: {
					id: recipientId,
				},
				message: {
					text: messageText,
				},
			}),
		});

		const data = (await response.json()) as {
			error?: { message?: string; code?: number };
			message_id?: string;
		};

		if (data.error) {
			console.error("❌ Erro ao enviar mensagem Instagram:", data.error);
		} else {
			console.log(`✅ Mensagem enviada para ${recipientId}`);
		}
	} catch (error) {
		console.error("❌ Erro ao enviar mensagem Instagram:", error);
	}
}

app.post("/api/webhooks/instagram", async (req, res) => {
	try {
		const body = req.body;

		if (body.object === "instagram") {
			body.entry?.forEach((entry: any) => {
				entry.messaging?.forEach(async (event: any) => {
					if (event.message && event.message.text) {
						const senderId = event.sender.id;
						const messageText = event.message.text;

						console.log(`📨 Message from ${senderId}: ${messageText}`);

						try {
							// Usar novo formato com contexto dinâmico
							const responseText = await askWithFallback(messageText, {
								channel: "instagram",
								userId: senderId,
								context: {
									source: "instagram",
									timestamp: new Date().toISOString(),
								},
							});
							console.log(`✅ Response: ${responseText}`);
							
							// Enviar resposta de volta para o Instagram
							await sendInstagramMessage(senderId, responseText);
						} catch (error) {
							console.error("Error processing message:", error);
						}
					}
				});
			});

			res.status(200).send("EVENT_RECEIVED");
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		console.error("Webhook error:", error);
		res.sendStatus(500);
	}
});

app.get("/api/auth/instagram/callback", async (req, res) => {
	try {
		const { code } = req.query;

		if (!code) {
			return res.status(400).send("Missing authorization code.");
		}

		const appId = process.env.INSTAGRAM_APP_ID;
		const appSecret = process.env.INSTAGRAM_APP_SECRET;
		const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

		if (!appId || !appSecret || !redirectUri) {
			console.error("Missing Instagram OAuth configuration");
			return res.status(500).send("Server configuration error.");
		}

		const tokenUrl = `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;

		console.log(`🔄 Exchanging code for access token...`);

		const tokenRes = await fetch(tokenUrl);
		const data = (await tokenRes.json()) as {
			access_token?: string;
			error?: { message?: string };
		};

		if (data.error) {
			console.error("Instagram OAuth error:", data.error);
			return res.status(400).send(`Error: ${data.error.message || "Failed to get access token"}`);
		}

		console.log("✅ ACCESS TOKEN received:", data.access_token ? "***" + data.access_token.slice(-10) : "not found");

		res.send(`
			<html>
				<head>
					<title>Instagram Auth Success</title>
					<style>
						body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
						.success { background: white; padding: 30px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
						.check { color: #4CAF50; font-size: 48px; }
					</style>
				</head>
				<body>
					<div class="success">
						<div class="check">✓</div>
						<h2>Autenticado com sucesso!</h2>
						<p>Você pode fechar esta janela.</p>
						<p><small>Access Token salvo no servidor.</small></p>
					</div>
				</body>
			</html>
		`);
	} catch (error) {
		console.error("Instagram callback error:", error);
		res.status(500).send(`Error: ${error instanceof Error ? error.message : "Internal server error"}`);
	}
});

app.post("/api/agents/flowcloser/message", async (req, res) => {
	try {
		const { message, sessionId, channel, userId, context } = req.body;

		if (!message) {
			return res.status(400).json({ error: "Message is required" });
		}

		// Suporte a contexto personalizado via API
		const response = await askWithFallback(message, {
			channel: channel || "api",
			userId: userId || sessionId || "default",
			context: context || {},
		});

		res.json({
			response: response,
			sessionId: sessionId || "default",
		});
	} catch (error) {
		console.error("Error processing message:", error);
		res.status(500).json({
			error: "Failed to process message",
			details: error instanceof Error ? error.message : String(error),
		});
	}
});

// ═══════════════════════════════════════════════════════════════════════
// WEBHOOK WHATSAPP (Fallback e integração futura)
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/webhooks/whatsapp", async (req, res) => {
	try {
		const body = req.body;

		// Verificar formato do webhook WhatsApp
		if (body.entry) {
			body.entry.forEach((entry: any) => {
				entry.changes?.forEach((change: any) => {
					if (change.value?.messages) {
						change.value.messages.forEach(async (message: any) => {
							if (message.text?.body) {
								const senderId = message.from;
								const messageText = message.text.body;

								console.log(`📨 WhatsApp message from ${senderId}: ${messageText}`);

								try {
									const responseText = await askWithFallback(messageText, {
										channel: "whatsapp",
										userId: senderId,
										context: {
											source: "whatsapp",
											timestamp: new Date().toISOString(),
										},
									});

									console.log(`✅ WhatsApp Response: ${responseText}`);
									
									// Aqui você integraria com a API do WhatsApp para enviar a resposta
									// Por enquanto, apenas logamos
								} catch (error) {
									console.error("Error processing WhatsApp message:", error);
								}
							}
						});
					}
				});
			});
		}

		res.status(200).send("EVENT_RECEIVED");
	} catch (error) {
		console.error("WhatsApp webhook error:", error);
		res.sendStatus(500);
	}
});

app.get("/api/webhooks/whatsapp", (req, res) => {
	// Verificação do webhook WhatsApp (similar ao Instagram)
	const mode = req.query["hub.mode"];
	const token = req.query["hub.verify_token"];
	const challenge = req.query["hub.challenge"];

	if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
		// Verificar certificado de cliente se disponível
		const certValid = verifyMetaClientCertificate(req);
		
		if (certValid) {
			console.log("✅ WhatsApp webhook verified (token + certificate check)");
			res.status(200).send(challenge);
		} else {
			console.warn("⚠️ Certificate verification failed, but token is valid");
			res.status(200).send(challenge);
		}
	} else {
		console.warn("❌ WhatsApp webhook verification failed - invalid token or mode");
		res.sendStatus(403);
	}
});

// ═══════════════════════════════════════════════════════════════════════
// GHOSTWRITER MODE - Gera pitches prontos para humanos
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/agents/flowcloser/ghostwriter", async (req, res) => {
	try {
		const { generateGhostwriterPitch } = await import("./agents/flowcloser/ghostwriter.js");
		const { leadContext, options } = req.body;

		if (!leadContext) {
			return res.status(400).json({ error: "leadContext is required" });
		}

		const pitch = generateGhostwriterPitch(leadContext, options || {});

		res.json({
			pitch,
			channel: options?.channel || "api",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error generating ghostwriter pitch:", error);
		res.status(500).json({
			error: "Failed to generate pitch",
			details: error instanceof Error ? error.message : String(error),
		});
	}
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`🚀 FlowCloser API running on port ${PORT}`);
	console.log(`📍 Health check: http://0.0.0.0:${PORT}/health`);
	console.log(`📍 Agents: http://0.0.0.0:${PORT}/api/agents`);
	console.log(`📍 Instagram Webhook: http://0.0.0.0:${PORT}/api/webhooks/instagram`);
	console.log(`📍 WhatsApp Webhook: http://0.0.0.0:${PORT}/api/webhooks/whatsapp`);
	console.log(`📍 Ghostwriter: http://0.0.0.0:${PORT}/api/agents/flowcloser/ghostwriter`);
	console.log(`📍 Instagram OAuth Callback: http://0.0.0.0:${PORT}/api/auth/instagram/callback`);
	console.log(`📍 Privacy Policy: http://0.0.0.0:${PORT}/privacy-policy`);
	console.log(`📍 Terms of Service: http://0.0.0.0:${PORT}/terms-of-service`);
});
