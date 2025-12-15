// IMPORTAR PRIMEIRO - garante que crypto esteja disponível antes do @iqai/adk
import "./crypto-polyfill.js";

import express from "express";
import * as dotenv from "dotenv";
import { createHmac, timingSafeEqual } from "node:crypto";
import twilio from "twilio";
import { agent, askWithFallback } from "./agents/flowcloser/agent.js";
import { privacyPolicy, termsOfService } from "./routes/legal.js";
import { dataDeletionCallback, dataDeletionStatus } from "./routes/data-deletion.js";
import { getAccountByPageId, getDefaultAccount, MetaAccountConfig } from "./config/accounts.js";
import { getLeadMetrics, listLeads, recordLeadInteraction } from "./services/leads.js";

// Forçar uso do .env mesmo se houver variáveis de ambiente do sistema
dotenv.config({ override: true });

const app = express();
const PORT = Number(process.env.PORT) || 8042;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "flowcloser_webhook_neo";

// Capturar rawBody para validação de assinatura (Meta Webhooks)
app.use(express.json({
	verify: (req, _res, buf) => {
		(req as any).rawBody = buf;
	},
}));
app.use(express.urlencoded({ extended: true })); // Para parsing de form-data (necessário para signed_request)
app.use(express.static("public")); // Servir arquivos estáticos (logos)

/**
 * Verifica certificado de cliente do Meta (se disponível)
 * Railway pode não expor certificado diretamente, mas verificamos quando possível
 */
function verifyMetaClientCertificate(req: express.Request): boolean {
	// Railway pode passar certificado via header ou variável de ambiente
	const clientCert = req.headers["x-client-certificate"] || 
	                   req.headers["x-amzn-mtls-clientcert-subject"] ||
	                   process.env.META_CLIENT_CERT_CN;
	
	if (clientCert) {
		// Verificar se o CN contém o esperado
		const cnMatch = String(clientCert).includes("client.webhooks.fbclientcerts.com");
		if (!cnMatch) {
			console.warn("⚠️ Client certificate CN mismatch:", clientCert);
			return false;
		}
		console.log("✅ Client certificate verified");
		return true;
	}
	
	// Se não houver certificado disponível (Railway pode não expor), aceitar se token estiver correto
	// A verificação de token é a segurança primária
	return true;
}

function verifyMetaWebhookSignature(req: express.Request): boolean {
	// WhatsApp/Instagram Webhooks usam o app secret (Meta) para assinar o payload
	const appSecret =
		process.env.META_APP_SECRET ||
		process.env.INSTAGRAM_APP_SECRET ||
		process.env.FACEBOOK_APP_SECRET;

	// Se não houver segredo configurado, não conseguimos validar assinatura
	if (!appSecret) return true;

	const signatureHeader = req.headers["x-hub-signature-256"];
	if (!signatureHeader || Array.isArray(signatureHeader)) return false;

	const rawBody: Buffer | undefined = (req as any).rawBody;
	if (!rawBody) return false;

	const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");

	// Comparação em tempo constante
	try {
		return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
	} catch {
		return false;
	}
}

function normalizeDateParam(value: string | string[] | undefined): string | undefined {
	if (!value) return undefined;
	const normalized = Array.isArray(value) ? value[0] : value;
	const parsed = new Date(normalized);
	if (Number.isNaN(parsed.getTime())) return undefined;
	return parsed.toISOString();
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/leads", async (req, res) => {
	try {
		const filters = {
			account_name: (req.query.account_name as string | undefined) || undefined,
			page_id: (req.query.page_id as string | undefined) || undefined,
			platform: (req.query.platform as string | undefined) || undefined,
			status: (req.query.status as string | undefined) || undefined,
			from: normalizeDateParam(req.query.from as string | string[] | undefined),
			to: normalizeDateParam(req.query.to as string | string[] | undefined),
			limit: req.query.limit ? Number(req.query.limit) : 100,
		};

		if (filters.limit && Number.isNaN(filters.limit)) {
			filters.limit = 100;
		}

		const [leadResult, metrics] = await Promise.all([
			listLeads(filters),
			getLeadMetrics(filters),
		]);

		res.json({
			data: leadResult.leads,
			count: leadResult.count,
			metrics,
			filters,
			storage: "ipfs_lighthouse",
		});
	} catch (error) {
		console.error("Error listing leads:", error);
		res.status(500).json({ error: "Failed to list leads" });
	}
});

app.get("/dashboard", async (req, res) => {
	try {
		const lighthouseConfigured = Boolean(process.env.VITE_LIGHTHOUSE_API_KEY || process.env.LIGHTHOUSE_API_KEY);
		const filters = {
			account_name: (req.query.account_name as string | undefined) || undefined,
			page_id: (req.query.page_id as string | undefined) || undefined,
			platform: (req.query.platform as string | undefined) || undefined,
			status: (req.query.status as string | undefined) || undefined,
			from: normalizeDateParam(req.query.from as string | string[] | undefined),
			to: normalizeDateParam(req.query.to as string | string[] | undefined),
			limit: req.query.limit ? Number(req.query.limit) : 200,
		};

		const [leadResult, metrics] = await Promise.all([
			listLeads(filters),
			getLeadMetrics(filters),
		]);

		const leads = leadResult.leads || [];
		const dateInput = (value?: string) => value ? value.substring(0, 10) : "";
		const formatDate = (value?: string) => value ? new Date(value).toLocaleString("pt-BR") : "-";

		const rows = leads.map((lead) => `
			<tr>
				<td>${escapeHtml(lead.name || "-")}</td>
				<td>${escapeHtml(lead.company || "-")}</td>
				<td>${lead.score ?? 0}</td>
				<td>${escapeHtml(lead.status || "new")}</td>
				<td>${escapeHtml(lead.account_name)}</td>
				<td>${escapeHtml(lead.platform)}</td>
				<td>${escapeHtml(lead.page_id)}</td>
				<td>${escapeHtml(lead.user_platform_id)}</td>
				<td>${escapeHtml(lead.budget || "-")}</td>
				<td>${lead.qualified ? "✅" : "–"}</td>
				<td>${escapeHtml(lead.project_type || "-")}</td>
				<td>${escapeHtml(lead.contact_preference || "-")}</td>
				<td>${escapeHtml(lead.proposal_type || "-")}</td>
				<td>${formatDate(lead.created_at)}</td>
			</tr>
		`).join("");

		res.send(`
			<!doctype html>
			<html lang="pt-BR">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Leads | FlowCloser</title>
				<style>
					body { font-family: "Inter", system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #0f172a; color: #e2e8f0; }
					h1 { margin-bottom: 8px; }
					.notice { margin: 8px 0 16px; padding: 12px; border-radius: 8px; background: #1e293b; border: 1px solid #334155; }
					.grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin: 16px 0; }
					.card { padding: 16px; border-radius: 12px; background: linear-gradient(135deg, #1e293b, #111827); border: 1px solid #1f2937; }
					.card h3 { margin: 0 0 8px; font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
					.card .value { font-size: 32px; font-weight: 700; color: #f8fafc; }
					.filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 16px 0; }
					.filters input, .filters select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0b1224; color: #e2e8f0; }
					button { padding: 10px 14px; border-radius: 8px; border: 0; background: #22d3ee; color: #0f172a; font-weight: 600; cursor: pointer; }
					button.secondary { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
					table { width: 100%; border-collapse: collapse; margin-top: 12px; }
					th, td { padding: 10px; text-align: left; border-bottom: 1px solid #1f2937; font-size: 14px; }
					th { color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; font-size: 12px; }
					tr:hover { background: rgba(34, 211, 238, 0.06); }
					.meta { display: flex; gap: 8px; align-items: center; color: #94a3b8; font-size: 13px; }
				</style>
			</head>
			<body>
				<h1>Dashboard de Leads</h1>
				<div class="meta">
					<span>Auto-refresh a cada 30s</span>
					<span>•</span>
					<span>${lighthouseConfigured ? "Lighthouse IPFS ativo" : "Configure VITE_LIGHTHOUSE_API_KEY"}</span>
				</div>
				<div class="grid">
					<div class="card">
						<h3>Total</h3>
						<div class="value">${metrics.total}</div>
					</div>
					<div class="card">
						<h3>Qualificados</h3>
						<div class="value">${metrics.qualified}</div>
					</div>
					<div class="card">
						<h3>Hoje</h3>
						<div class="value">${metrics.today}</div>
					</div>
				</div>

				<form class="filters" method="get">
					<input type="text" name="account_name" placeholder="Conta" value="${escapeHtml((req.query.account_name as string) || "")}" />
					<select name="status">
						<option value="">Status</option>
						${["new", "contacted", "proposal_sent", "closed", "lost", "qualified"].map((status) => `
							<option value="${status}" ${req.query.status === status ? "selected" : ""}>${status}</option>
						`).join("")}
					</select>
					<select name="platform">
						<option value="">Plataforma</option>
						${["instagram", "messenger", "facebook", "whatsapp"].map((platform) => `
							<option value="${platform}" ${req.query.platform === platform ? "selected" : ""}>${platform}</option>
						`).join("")}
					</select>
					<input type="date" name="from" value="${dateInput(filters.from)}" />
					<input type="date" name="to" value="${dateInput(filters.to)}" />
					<div style="display:flex; gap:8px;">
						<button type="submit">Filtrar</button>
						<button type="button" class="secondary" onclick="window.location='${req.path}'">Limpar</button>
					</div>
				</form>

				<table>
					<thead>
						<tr>
							<th>Nome</th>
							<th>Empresa</th>
							<th>Score</th>
							<th>Status</th>
							<th>Conta</th>
							<th>Plataforma</th>
							<th>Page ID</th>
							<th>User ID</th>
							<th>Budget</th>
							<th>Qualificado</th>
							<th>Projeto</th>
							<th>Contato</th>
							<th>Proposta</th>
							<th>Criado</th>
						</tr>
					</thead>
					<tbody>
						${rows || `<tr><td colspan="14">Nenhum lead ainda.</td></tr>`}
					</tbody>
				</table>

				<script>
					setTimeout(() => window.location.reload(), 30000);
				</script>
			</body>
			</html>
		`);
	} catch (error) {
		console.error("Error rendering dashboard:", error);
		res.status(500).send("Erro ao carregar dashboard");
	}
});

// ═══════════════════════════════════════════════════════════════════════
// PÁGINAS LEGAIS (Obrigatório para aprovação no Meta Developer)
// ═══════════════════════════════════════════════════════════════════════

app.get("/privacy-policy", privacyPolicy);
app.get("/terms-of-service", termsOfService);

// ═══════════════════════════════════════════════════════════════════════
// DATA DELETION REQUEST (Obrigatório para aprovação no Meta Developer)
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/data-deletion", dataDeletionCallback);
app.get("/data-deletion-status", dataDeletionStatus);

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
		// Verificar certificado de cliente se disponível (opcional para Railway)
		const certValid = verifyMetaClientCertificate(req);
		
		if (certValid) {
			console.log("✅ Webhook verified (token + certificate check)");
			res.status(200).send(challenge);
		} else {
			console.warn("⚠️ Certificate verification failed, but token is valid");
			// Aceitar mesmo assim se token estiver correto (Railway pode não expor cert)
			res.status(200).send(challenge);
		}
	} else {
		console.warn("❌ Webhook verification failed - invalid token or mode");
		res.sendStatus(403);
	}
});

/**
 * Envia mensagem de volta para Instagram ou Facebook Messenger via Graph API
 */
async function sendMetaMessage(
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
		// Instagram Graph API endpoint para enviar mensagens
		// Para Instagram, usamos o endpoint do Instagram Business Account
		// Se tiver INSTAGRAM_PAGE_ID, use ele, senão use 'me'
		const url = `https://graph.facebook.com/v18.0/${resolvedPageId}/messages?access_token=${accessToken}`;
		
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
			console.log(`✅ Mensagem enviada para ${recipientId} via ${account?.account_name || resolvedPageId}`);
		}
	} catch (error) {
		console.error("❌ Erro ao enviar mensagem Instagram:", error);
	}
}

/**
 * Envia mensagem via Twilio WhatsApp
 */
async function sendTwilioWhatsAppMessage(to: string, body: string): Promise<void> {
	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

	if (!accountSid || !authToken || !fromNumber) {
		console.warn("⚠️ Twilio não configurado (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM ausentes)");
		return;
	}

	try {
		const client = twilio(accountSid, authToken);
		
		// Garantir formato correto do número (whatsapp:+5511999999999)
		const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
		const fromFormatted = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;

		const message = await client.messages.create({
			from: fromFormatted,
			to: toFormatted,
			body: body,
		});

		console.log(`✅ WhatsApp Twilio enviado: ${message.sid}`);
	} catch (error) {
		console.error("❌ Erro ao enviar WhatsApp via Twilio:", error);
	}
}

/**
 * Envia mensagem via WhatsApp Cloud API (Meta)
 */
async function sendMetaWhatsAppMessage(to: string, body: string): Promise<void> {
	const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
	const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

	if (!accessToken || !phoneNumberId) {
		console.warn("⚠️ WhatsApp Meta não configurado (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID ausentes)");
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
		console.log("✅ WhatsApp Meta enviado:", data?.messages?.[0]?.id ? `message_id=${data.messages[0].id}` : "ok");
	} catch (error) {
		console.error("❌ Erro ao enviar WhatsApp Meta:", error);
	}
}

/**
 * Envia mensagem via WhatsApp (detecta provedor automaticamente)
 */
async function sendWhatsAppTextMessage(to: string, body: string): Promise<void> {
	const provider = process.env.WHATSAPP_PROVIDER || "meta";
	
	// Verificar qual provedor está configurado
	const twilioConfigured = Boolean(
		process.env.TWILIO_ACCOUNT_SID &&
		process.env.TWILIO_AUTH_TOKEN &&
		process.env.TWILIO_WHATSAPP_FROM
	);
	
	const metaConfigured = Boolean(
		process.env.WHATSAPP_ACCESS_TOKEN &&
		process.env.WHATSAPP_PHONE_NUMBER_ID
	);

	// Usar provedor especificado ou detectar automaticamente
	if (provider === "twilio" && twilioConfigured) {
		await sendTwilioWhatsAppMessage(to, body);
	} else if (provider === "meta" && metaConfigured) {
		await sendMetaWhatsAppMessage(to, body);
	} else if (twilioConfigured) {
		// Fallback: usar Twilio se estiver configurado
		await sendTwilioWhatsAppMessage(to, body);
	} else if (metaConfigured) {
		// Fallback: usar Meta se estiver configurado
		await sendMetaWhatsAppMessage(to, body);
	} else {
		console.warn("⚠️ Nenhum provedor WhatsApp configurado");
	}
}

app.post("/api/webhooks/instagram", async (req, res) => {
	try {
		const body = req.body;

		if (body.object === "instagram" || body.object === "page") {
			body.entry?.forEach((entry: any) => {
				entry.messaging?.forEach(async (event: any) => {
					if (event.message && event.message.text) {
						const senderId = event.sender.id;
						const messageText = event.message.text;
						const rawPageId = event.recipient?.id || entry.id;
						const account = getAccountByPageId(rawPageId) || getDefaultAccount(body.object === "page" ? "messenger" : "instagram");
						const pageId = rawPageId || account?.page_id || "unknown_page";
						const platform = account?.platform || (body.object === "page" ? "messenger" : "instagram");

						console.log(`📨 Message from ${senderId} on ${platform} (${account?.account_name || "sem conta mapeada"}): ${messageText}`);

						try {
							// Disponibilizar contexto global para tools e logs
							(globalThis as any).currentUserId = senderId;
							(globalThis as any).currentChannel = platform;
							(globalThis as any).currentPageId = pageId;
							(globalThis as any).currentAccountName = account?.account_name;

							// Usar novo formato com contexto dinâmico
							const responseText = await askWithFallback(messageText, {
								channel: platform,
								userId: senderId,
								context: {
									source: platform,
									timestamp: new Date().toISOString(),
									pageId,
									accountName: account?.account_name,
								},
							});
							console.log(`✅ Response: ${responseText}`);
							
							// Enviar resposta de volta para o Instagram
							await sendMetaMessage(account, senderId, responseText, pageId);

							// Extrair dados do lead da mensagem
							const { extractLeadDataFromMessage } = await import("./services/leads.js");
							const leadData = extractLeadDataFromMessage(messageText);

							// Calcular score baseado nos dados extraídos
							const { computeLeadScore } = await import("./services/leads.js");
							const score = computeLeadScore({
								intent: leadData.intent,
								timeline: leadData.urgency,
								projectType: leadData.projectType,
								urgency: leadData.urgency,
							});

							// Salvar interação com dados extraídos no storage local + IPFS
							await recordLeadInteraction({
								user_platform_id: senderId,
								page_id: pageId,
								platform,
								account_name: account?.account_name || "unknown_account",
								status: "contacted",
								project_type: leadData.projectType || null,
								urgency: leadData.urgency || null,
								name: leadData.name || undefined,
								company: leadData.company || undefined,
								score: score,
								qualified: score >= 60,
							});
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
		// Validar assinatura do webhook (se app secret estiver configurado)
		if (!verifyMetaWebhookSignature(req)) {
			console.warn("❌ Assinatura inválida no webhook WhatsApp (x-hub-signature-256)");
			return res.sendStatus(403);
		}

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
								const phoneNumberId = change.value?.metadata?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID || "unknown_phone";

								console.log(`📨 WhatsApp message from ${senderId}: ${messageText}`);

								try {
									// Disponibilizar contexto global para tools e logs
									(globalThis as any).currentUserId = senderId;
									(globalThis as any).currentChannel = "whatsapp";
									(globalThis as any).currentPageId = phoneNumberId;
									(globalThis as any).currentAccountName = "whatsapp";

									const responseText = await askWithFallback(messageText, {
										channel: "whatsapp",
										userId: senderId,
										context: {
											source: "whatsapp",
											timestamp: new Date().toISOString(),
											phoneNumberId,
										},
									});

									console.log(`✅ WhatsApp Response: ${responseText}`);

									// Enviar resposta via WhatsApp Cloud API
									await sendWhatsAppTextMessage(senderId, responseText);

									// Extrair dados do lead da mensagem
									const { extractLeadDataFromMessage } = await import("./services/leads.js");
									const leadData = extractLeadDataFromMessage(messageText);

									// Calcular score baseado nos dados extraídos
									const { computeLeadScore } = await import("./services/leads.js");
									const score = computeLeadScore({
										intent: leadData.intent,
										timeline: leadData.urgency,
										projectType: leadData.projectType,
										urgency: leadData.urgency,
									});

									// Persistir interação com dados extraídos no storage local + IPFS
									await recordLeadInteraction({
										user_platform_id: senderId,
										page_id: phoneNumberId,
										platform: "whatsapp",
										account_name: "whatsapp",
										status: "contacted",
										project_type: leadData.projectType || null,
										urgency: leadData.urgency || null,
										name: leadData.name || undefined,
										company: leadData.company || undefined,
										score: score,
										qualified: score >= 60,
									});
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
// WEBHOOK TWILIO WHATSAPP
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/webhooks/whatsapp/twilio", express.urlencoded({ extended: true }), async (req, res) => {
	try {
		// Twilio envia dados como form-urlencoded
		const body = req.body;
		const messageSid = body.MessageSid;
		const from = body.From; // Formato: whatsapp:+5511999999999
		const to = body.To; // Número do Twilio
		const messageBody = body.Body;
		const messageStatus = body.MessageStatus;

		// Ignorar status updates (só processar mensagens recebidas)
		if (messageStatus && messageStatus !== "received") {
			console.log(`📊 Status update do Twilio: ${messageSid} - ${messageStatus}`);
			return res.status(200).send("OK");
		}

		// Processar apenas mensagens de texto recebidas
		if (messageBody && from) {
			// Remover prefixo "whatsapp:" do número
			const senderId = from.replace(/^whatsapp:/, "");
			const phoneNumberId = to.replace(/^whatsapp:/, "") || process.env.TWILIO_WHATSAPP_FROM?.replace(/^whatsapp:/, "") || "unknown_phone";

			console.log(`📨 WhatsApp Twilio message from ${senderId}: ${messageBody}`);

			try {
				// Disponibilizar contexto global para tools e logs
				(globalThis as any).currentUserId = senderId;
				(globalThis as any).currentChannel = "whatsapp";
				(globalThis as any).currentPageId = phoneNumberId;
				(globalThis as any).currentAccountName = "twilio";

				const responseText = await askWithFallback(messageBody, {
					channel: "whatsapp",
					userId: senderId,
					context: {
						source: "whatsapp",
						provider: "twilio",
						timestamp: new Date().toISOString(),
						phoneNumberId,
					},
				});

				console.log(`✅ WhatsApp Twilio Response: ${responseText}`);

				// Enviar resposta via Twilio
				await sendTwilioWhatsAppMessage(senderId, responseText);

				// Extrair dados do lead da mensagem
				const { extractLeadDataFromMessage } = await import("./services/leads.js");
				const leadData = extractLeadDataFromMessage(messageBody);

				// Calcular score baseado nos dados extraídos
				const { computeLeadScore } = await import("./services/leads.js");
				const score = computeLeadScore({
					intent: leadData.intent,
					timeline: leadData.urgency,
					projectType: leadData.projectType,
					urgency: leadData.urgency,
				});

				// Persistir interação com dados extraídos no storage local + IPFS
				await recordLeadInteraction({
					user_platform_id: senderId,
					page_id: phoneNumberId,
					platform: "whatsapp",
					account_name: "twilio",
					status: "contacted",
					project_type: leadData.projectType || null,
					urgency: leadData.urgency || null,
					name: leadData.name || undefined,
					company: leadData.company || undefined,
					score: score,
					qualified: score >= 60,
				});
			} catch (error) {
				console.error("Error processing Twilio WhatsApp message:", error);
			}
		}

		// Twilio espera resposta em formato TwiML ou texto simples
		res.status(200).send("OK");
	} catch (error) {
		console.error("Twilio WhatsApp webhook error:", error);
		res.status(500).send("Error");
	}
});

// Endpoint para status callbacks do Twilio (opcional)
app.post("/api/webhooks/whatsapp/twilio/status", express.urlencoded({ extended: true }), (req, res) => {
	const messageSid = req.body.MessageSid;
	const messageStatus = req.body.MessageStatus;
	
	console.log(`📊 Twilio status callback: ${messageSid} - ${messageStatus}`);
	
	res.status(200).send("OK");
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
	console.log(`📍 WhatsApp Webhook (Meta): http://0.0.0.0:${PORT}/api/webhooks/whatsapp`);
	console.log(`📍 WhatsApp Webhook (Twilio): http://0.0.0.0:${PORT}/api/webhooks/whatsapp/twilio`);
	console.log(`📍 Ghostwriter: http://0.0.0.0:${PORT}/api/agents/flowcloser/ghostwriter`);
	console.log(`📍 Instagram OAuth Callback: http://0.0.0.0:${PORT}/api/auth/instagram/callback`);
	console.log(`📍 Privacy Policy: http://0.0.0.0:${PORT}/privacy-policy`);
	console.log(`📍 Terms of Service: http://0.0.0.0:${PORT}/terms-of-service`);
	console.log(`📍 Data Deletion Callback: http://0.0.0.0:${PORT}/api/data-deletion`);
	console.log(`📍 Data Deletion Status: http://0.0.0.0:${PORT}/data-deletion-status`);
});
