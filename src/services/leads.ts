import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import * as os from "node:os";
import { MetaPlatform } from "../config/accounts.js";

export interface LeadRecord {
	id?: string;
	name: string;
	company: string;
	score: number;
	budget: string;
	qualified: boolean;
	page_id: string;
	platform: string;
	account_name: string;
	user_platform_id: string;
	project_type?: string | null;
	urgency?: string | null;
	contact_preference?: string | null;
	proposal_url?: string | null;
	proposal_type?: "custom" | "template" | null;
	status: string;
	ipfs_cid?: string | null;
	created_at?: string;
	updated_at?: string;
	last_contact_at?: string | null;
}

export interface LeadUpsertInput {
	page_id: string;
	platform: MetaPlatform | string;
	account_name: string;
	user_platform_id: string;
	name?: string;
	company?: string;
	score?: number;
	budget?: string;
	qualified?: boolean;
	project_type?: string | null;
	urgency?: string | null;
	contact_preference?: string | null;
	proposal_url?: string | null;
	proposal_type?: "custom" | "template" | null;
	status?: string;
	last_contact_at?: string | null;
}

export interface LeadFilters {
	account_name?: string;
	page_id?: string;
	platform?: string;
	status?: string;
	from?: string;
	to?: string;
	limit?: number;
}

export interface LeadMetrics {
	total: number;
	qualified: number;
	today: number;
}

const dataDir = path.join(process.cwd(), "data");
const leadsFile = path.join(dataDir, "leads.json");

type StorachaClient = {
	uploadFile: (file: any, options?: any) => Promise<any>;
	uploadDirectory: (files: any, options?: any) => Promise<any>;
	addSpace: (proof: any) => Promise<{ did: () => string }>;
	setCurrentSpace: (did: string) => Promise<void>;
	currentSpace?: () => string;
};

let storachaClientPromise: Promise<StorachaClient> | null = null;

function normalizeStorachaUcanToken(value: string): string {
	// Remover espaços / quebras de linha e normalizar base64url -> base64
	let token = value.replace(/\s+/g, "").trim();
	token = token.replace(/-/g, "+").replace(/_/g, "/");
	while (token.length % 4 !== 0) token += "=";
	return token;
}

async function getStorachaClient(): Promise<StorachaClient> {
	if (storachaClientPromise) return storachaClientPromise;

	storachaClientPromise = (async () => {
		const Storacha = await import("@storacha/client");
		const client = (await (Storacha as any).create()) as StorachaClient;

		const ucanRaw = process.env.STORACHA_UCAN;
		const spaceDid = process.env.STORACHA_SPACE_DID;

		if (ucanRaw) {
			const normalized = normalizeStorachaUcanToken(ucanRaw);
			// Proof.parse é exportado via subpath @storacha/client/proof
			const Proof = await import("@storacha/client/proof");
			const proof = await (Proof as any).parse(normalized);
			const space = await client.addSpace(proof);
			await client.setCurrentSpace(space.did());
		} else if (spaceDid) {
			await client.setCurrentSpace(spaceDid);
		}

		return client;
	})();

	return storachaClientPromise;
}

function ensureLeadsFile() {
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
	if (!fs.existsSync(leadsFile)) {
		fs.writeFileSync(leadsFile, "[]", "utf-8");
	}
}

async function loadLeadsFromDisk(): Promise<LeadRecord[]> {
	try {
		ensureLeadsFile();
		const content = await fs.promises.readFile(leadsFile, "utf-8");
		const parsed = JSON.parse(content);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.warn("⚠️ Falha ao ler leads do disco:", error);
		return [];
	}
}

async function persistLeads(leads: LeadRecord[]): Promise<void> {
	try {
		ensureLeadsFile();
		await fs.promises.writeFile(leadsFile, JSON.stringify(leads, null, 2), "utf-8");
	} catch (error) {
		console.warn("⚠️ Falha ao salvar leads no disco:", error);
	}
}

function normalizeLead(input: LeadUpsertInput): LeadRecord {
	const nowIso = new Date().toISOString();

	return {
		id: randomUUID(),
		name: input.name || `Lead ${input.user_platform_id}`,
		company: input.company || "N/A",
		score: input.score ?? 0,
		budget: input.budget || "unknown",
		qualified: input.qualified ?? false,
		page_id: input.page_id || "unknown_page",
		platform: input.platform || "instagram",
		account_name: input.account_name || "unknown_account",
		user_platform_id: input.user_platform_id,
		project_type: input.project_type ?? null,
		urgency: input.urgency ?? null,
		contact_preference: input.contact_preference ?? null,
		proposal_url: input.proposal_url ?? null,
		proposal_type: input.proposal_type ?? null,
		status: input.status || "new",
		last_contact_at: input.last_contact_at || nowIso,
		created_at: nowIso,
		updated_at: nowIso,
		ipfs_cid: null,
	};
}

function applyFilters(leads: LeadRecord[], filters: LeadFilters = {}): LeadRecord[] {
	return leads.filter((lead) => {
		if (filters.account_name && lead.account_name !== filters.account_name) return false;
		if (filters.page_id && lead.page_id !== filters.page_id) return false;
		if (filters.platform && lead.platform !== filters.platform) return false;
		if (filters.status && lead.status !== filters.status) return false;
		if (filters.from && lead.created_at && new Date(lead.created_at) < new Date(filters.from)) return false;
		if (filters.to && lead.created_at && new Date(lead.created_at) > new Date(filters.to)) return false;
		return true;
	});
}

function startOfTodayIso(): string {
	const now = new Date();
	const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
	return start.toISOString();
}

export async function uploadLeadToIpfs(payload: LeadRecord): Promise<string | null> {
	try {
		const ucan = process.env.STORACHA_UCAN;
		const spaceDid = process.env.STORACHA_SPACE_DID;

		if (!ucan && !spaceDid) {
			console.warn("⚠️ STORACHA_UCAN/STORACHA_SPACE_DID não configurados; pulando upload para IPFS (Storacha)");
			return null;
		}

		const client = await getStorachaClient();
		const json = JSON.stringify(payload, null, 2);
		const fileName = `lead-${payload.user_platform_id}-${Date.now()}.json`;

		// Preferir upload direto em memória (quando File existir)
		const FileCtor = (globalThis as any).File;
		if (typeof FileCtor === "function") {
			const file = new FileCtor([new Blob([json], { type: "application/json" })], fileName, {
				type: "application/json",
			});
			const cid = await client.uploadFile(file, client.currentSpace ? { space: client.currentSpace() } : undefined);
			return String(cid);
		}

		// Fallback: escrever em arquivo temporário e subir como diretório
		const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "flowcloser-storacha-"));
		const tmpFile = path.join(tmpDir, fileName);
		await fs.promises.writeFile(tmpFile, json, "utf-8");

		const { filesFromPaths } = await import("files-from-path");
		const files = await filesFromPaths([tmpFile]);
		const cid = await client.uploadDirectory(files, client.currentSpace ? { space: client.currentSpace() } : undefined);
		return String(cid);
	} catch (error) {
		console.warn("⚠️ Erro ao subir lead para Storacha:", error);
	}

	return null;
}

export async function recordLeadInteraction(input: LeadUpsertInput): Promise<void> {
	const leads = await loadLeadsFromDisk();
	const nowIso = new Date().toISOString();
	const normalized = normalizeLead(input);

	// Atualizar se já existe lead para a mesma conta/usuário
	const existingIndex = leads.findIndex(
		(l) => l.page_id === normalized.page_id && l.user_platform_id === normalized.user_platform_id,
	);

	let record = normalized;

	if (existingIndex >= 0) {
		record = {
			...leads[existingIndex],
			...normalized,
			id: leads[existingIndex].id,
			created_at: leads[existingIndex].created_at || normalized.created_at,
			updated_at: nowIso,
		};
		leads[existingIndex] = record;
	} else {
		leads.unshift(record);
	}

	await persistLeads(leads);

	// Upload assíncrono para IPFS (Storacha)
	const cid = await uploadLeadToIpfs(record);
	if (cid) {
		const idx = leads.findIndex(
			(l) => l.page_id === record.page_id && l.user_platform_id === record.user_platform_id,
		);
		if (idx >= 0) {
			leads[idx].ipfs_cid = cid;
			await persistLeads(leads);
		}
	}
}

export async function listLeads(filters: LeadFilters = {}): Promise<{ leads: LeadRecord[]; count: number }> {
	const leads = await loadLeadsFromDisk();
	const filtered = applyFilters(leads, filters);
	const sorted = filtered.sort((a, b) => {
		const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
		const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
		return dateB - dateA;
	});

	const limited = typeof filters.limit === "number" ? sorted.slice(0, filters.limit) : sorted;
	return { leads: limited, count: filtered.length };
}

export async function getLeadMetrics(filters: Partial<LeadFilters> = {}): Promise<LeadMetrics> {
	const leads = await loadLeadsFromDisk();
	const filtered = applyFilters(leads, filters as LeadFilters);

	const total = filtered.length;
	const qualified = filtered.filter((l) => l.qualified).length;
	const todayIso = startOfTodayIso();
	const today = filtered.filter((l) => l.created_at && l.created_at >= todayIso).length;

	return { total, qualified, today };
}

export function computeLeadScore(signals: {
	intent?: string;
	budget?: string;
	timeline?: string;
	painPoints?: string[];
	qualified?: boolean;
	projectType?: string;
	urgency?: string;
}): number {
	let score = 50;

	if (signals.intent) score += 10;
	if (signals.budget) score += 10;
	if (signals.timeline) score += 10;
	if (signals.painPoints && signals.painPoints.length > 0) score += 10;
	if (signals.qualified) score += 10;
	if (signals.projectType) score += 5;
	if (signals.urgency && (signals.urgency.toLowerCase().includes("urgent") || signals.urgency.toLowerCase().includes("urgente"))) score += 10;

	return Math.min(100, score);
}

/**
 * Extrai informações do lead da mensagem e histórico da conversa
 */
export function extractLeadDataFromMessage(
	message: string,
	conversationHistory?: Array<{ role: string; content: string }>
): {
	projectType?: string;
	urgency?: string;
	intent?: string;
	name?: string;
	company?: string;
} {
	const msg = message.toLowerCase();
	const fullText = conversationHistory
		? [...conversationHistory.map(m => m.content), message].join(" ").toLowerCase()
		: msg;

	const extracted: {
		projectType?: string;
		urgency?: string;
		intent?: string;
		name?: string;
		company?: string;
	} = {};

	// Extrair tipo de projeto
	if (fullText.includes("webapp") || fullText.includes("web app") || fullText.includes("aplicativo web")) {
		extracted.projectType = "webapp";
	} else if (fullText.includes("site") || fullText.includes("website") || fullText.includes("página")) {
		extracted.projectType = "site";
	} else if (fullText.includes("pwa") || fullText.includes("progressive web app")) {
		extracted.projectType = "pwa";
	} else if (fullText.includes("sistema") || fullText.includes("sistema") || fullText.includes("app")) {
		extracted.projectType = "sistema";
	}

	// Extrair urgência
	if (fullText.includes("urgente") || fullText.includes("urgent") || fullText.includes("rápido") || fullText.includes("rapido")) {
		extracted.urgency = "urgent";
	} else if (fullText.match(/\d+\s*(dias|dia|days|day|semanas|semana|weeks|week|meses|mês|months|month)/)) {
		const match = fullText.match(/(\d+)\s*(dias|dia|days|day|semanas|semana|weeks|week|meses|mês|months|month)/);
		if (match) {
			extracted.urgency = match[0];
		}
	}

	// Extrair intenção
	if (fullText.includes("atualizar") || fullText.includes("modernizar") || fullText.includes("melhorar")) {
		extracted.intent = "update";
	} else if (fullText.includes("criar") || fullText.includes("fazer") || fullText.includes("novo")) {
		extracted.intent = "create";
	} else if (fullText.includes("preciso") || fullText.includes("quero") || fullText.includes("gostaria")) {
		extracted.intent = "interested";
	}

	// Tentar extrair nome (padrões comuns)
	const namePatterns = [
		/meu nome é ([\p{L}\s]+)/iu,
		/eu sou ([\p{L}\s]+)/iu,
		/chamo-me ([\p{L}\s]+)/iu,
		/sou o ([\p{L}\s]+)/iu,
		/sou a ([\p{L}\s]+)/iu,
	];
	for (const pattern of namePatterns) {
		const match = message.match(pattern);
		if (match && match[1]) {
			extracted.name = match[1].trim();
			break;
		}
	}

	// Tentar extrair empresa
	const companyPatterns = [
		/empresa (\w+)/i,
		/da (\w+)/i,
		/na (\w+)/i,
	];
	for (const pattern of companyPatterns) {
		const match = message.match(pattern);
		if (match && match[1] && match[1].length > 2) {
			extracted.company = match[1];
			break;
		}
	}

	return extracted;
}
