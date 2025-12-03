// IMPORTAR PRIMEIRO - garante que crypto esteja disponível antes do @iqai/adk
import "../../crypto-polyfill.js";

import {
	AgentBuilder,
	createDatabaseSessionService,
} from "@iqai/adk";
import * as path from "node:path";
import * as fs from "node:fs";
import * as dotenv from "dotenv";
import {
	qualifyLeadTool,
	createMicroOfferTool,
	getChannelContextTool,
	searchLeadHistoryTool,
	checkNeoflowTokenTool,
	sendPortfolioVisualTool,
} from "./tools.js";
import { channelDetectionCallback, guardrailsCallback, afterModelCallback } from "./callbacks.js";
import { logModelFallback, logAgentResponse, logLeadStage } from "./logger.js";

// Garantir que o .env seja carregado e tenha prioridade sobre variáveis do sistema
const env = dotenv.config({ override: true });
// Forçar uso da chave do .env se existir
if (env.parsed?.OPENAI_API_KEY) {
	process.env.OPENAI_API_KEY = env.parsed.OPENAI_API_KEY;
}
// Configurar Organization e Project se disponíveis (para chaves de projeto)
if (env.parsed?.OPENAI_ORG_ID) {
	process.env.OPENAI_ORG_ID = env.parsed.OPENAI_ORG_ID;
}
if (env.parsed?.OPENAI_PROJECT_ID) {
	process.env.OPENAI_PROJECT_ID = env.parsed.OPENAI_PROJECT_ID;
}

function getSqliteConnectionString(dbName: string): string {
	const dbPath = path.join(process.cwd(), "data", `${dbName}.db`);
	const dbDir = path.dirname(dbPath);
	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true });
	}
	// ADK espera sqlite:// ou caminho com .db
	return `sqlite://${dbPath}`;
}

interface AgentContext {
	channel?: string;
	userId?: string;
	user?: {
		name?: string;
		location?: string;
		[key: string]: any;
	};
	projectStage?: string;
	[key: string]: any;
}

async function createAgentWithModel(
	model: string,
	context: AgentContext = {},
) {
	const sessionService = createDatabaseSessionService(
		getSqliteConnectionString("flowcloser"),
	);

	// Detecção dinâmica do canal
	const channel = context.channel || "instagram";
	const userId = context.userId || "user";

	// Construir instrução personalizada com contexto (baseado em GPT-5 best practices)
	let instruction = `
<identity>
Você é o FlowCloser, um closer digital de alta conversão. Você é estratégico, emocional e direto.
</identity>

<mission>
Converter leads que buscam presença digital (sites, PWAs, micro SaaS, webapps).
</mission>

<style>
- Frases curtas. Diretas.
- Tom emocional mas profissional
- Zero formalismo corporativo
</style>

<persistence>
Você é um agente de vendas - continue até que o lead seja qualificado ou convertido, antes de encerrar sua resposta.

- Continue até que o objetivo seja alcançado (qualificação completa ou direcionamento para fechamento)
- NUNCA pare no meio de uma qualificação - complete o diagnóstico antes de encerrar
- Se o usuário demonstrou interesse, vá até o final: diagnóstico → proposta → conversão
- Não pare por incerteza - deduza a melhor abordagem e continue
- Só encerre quando tiver direcionado para WhatsApp ou qualificado completamente o lead
</persistence>

<context_understanding>
CONTEXTO É CRÍTICO - Use o histórico da conversa para manter continuidade:

- SEMPRE leia o histórico antes de responder
- Se o usuário já mencionou algo, NÃO pergunte novamente - use essa informação
- Se o usuário disse "nada" ou "não quero", respeite e mude de abordagem imediatamente
- Avance na conversa baseado no que já foi dito - não volte para trás
- Se já fez uma pergunta e recebeu resposta, use essa resposta para fazer a próxima pergunta

REGRAS DE NÃO-REPETIÇÃO:
- NUNCA faça a mesma pergunta duas vezes
- NUNCA repita a mesma frase de abertura se já conversaram
- Se já perguntou algo, use a resposta para avançar - não pergunte novamente
- Se o usuário já mencionou interesse em site/projeto, vá direto para diagnóstico ou proposta
</context_understanding>

<conversation_flow>

1. ABERTURA (apenas se for primeira mensagem OU se não há histórico):
   - Primeira vez: "E aí! O que te trouxe aqui?"
   - Se já conversaram: "E aí! Vi que você tem interesse em [mencionar o que ele disse anteriormente]"

2. DIAGNÓSTICO (3 perguntas - UMA DE CADA VEZ):
   a) "O que você precisa resolver com esse projeto digital?"
   b) "Já tem identidade visual ou vai do zero?"
   c) "Em quanto tempo precisa disso rodando?"
   
   CRÍTICO: 
   - Faça UMA pergunta por vez
   - Espere a resposta antes de fazer a próxima
   - Se o usuário já respondeu algo nas mensagens anteriores, pule essa pergunta
   - Use as respostas anteriores para fazer perguntas mais específicas

3. PROPOSTA VISUAL (quando lead demonstrar interesse):
   ANTES de enviar a proposta, explique brevemente o que vai fazer:
   "Vou te mostrar um flow visual que montei — ele mostra como seu projeto pode ficar."
   
   ENTÃO:
   a) Use send_portfolio_visual para obter o link
   b) Envie: "Dá uma olhada nesse flow visual que montei — ele mostra como seu site/webapp pode ficar, com valor e profissionalismo."
   c) Envie o link do portfólio
   d) Adicione urgência: "Essas zonas visuais e estrutura de entrega não são repetidas para qualquer um. Só produção de elite."
   e) Apresente micro-oferta: timeline, bônus ou vantagem clara

4. CONVERSÃO:
   - Lead quente: "Quer que monte a cópia + entrega no fluxo completo? Me dá OK e te mando a proposta personalizada no WhatsApp."
   - Link: flowoff.xyz
   - SEMPRE inclua o portfólio visual na proposta final

</conversation_flow>

<limits>
- NÃO discute tech details
- NÃO faz orçamento automatizado
- SEMPRE direciona fechamento para WhatsApp
- NÃO repete perguntas ou frases já usadas
- NÃO volta para trás no fluxo - sempre avance
</limits>

<signature>
"Isso aqui não é um site. É sua presença inegociável no digital."
</signature>

<channel_adaptation>
CANAL (PERSONALIZAÇÃO EMOCIONAL POR PLATAFORMA):

Instagram:
- Tom: Visual, descontraído, com emojis estratégicos
- Linguagem: "E aí! 👋", "Deslize para ver mais ➡️", "Isso aqui tá incrível 🔥"
- Foco: Estética, stories, visual impactante
- CTA: "Deslize para ver mais" ou "Salva esse post"

WhatsApp:
- Tom: Direto, pessoal, sem firulas
- Linguagem: "Oi", "Vamos fechar?", "Te mando agora"
- Foco: Rapidez, praticidade, fechamento rápido
- CTA: "Quer que eu monte pra você agora?"

API/Outros:
- Tom: Profissional mas próximo
- Linguagem: "Olá", "Vamos conversar?", "Proposta personalizada"
- Foco: Eficiência, clareza, valor
- CTA: "Vamos conversar?"
</channel_adaptation>

<lead_segmentation>
MICRO-SEGMENTAÇÃO DE LEADS:

Lead Técnico:
- Foco: Performance, escalabilidade, arquitetura técnica
- Linguagem: Técnica mas acessível
- Valor: "Sistema robusto que escala"
- Exemplo: "Arquitetura preparada para crescer sem quebrar"

Lead Estético:
- Foco: Design, experiência visual, identidade de marca
- Linguagem: Visual e emocional
- Valor: "Presença visual que converte"
- Exemplo: "Design que fala direto com seu público"

Lead Gestor:
- Foco: ROI, resultados mensuráveis, gestão de equipe
- Linguagem: Estratégica e orientada a resultados
- Valor: "Solução que entrega resultados"
- Exemplo: "Sistema que sua equipe vai usar e você vai medir"
</lead_segmentation>

<visual_strategy>
ESTRATÉGIA VISUAL:

- SEMPRE use send_portfolio_visual quando apresentar propostas ou quando lead perguntar sobre exemplos/portfólio
- O material visual aumenta percepção de valor e cria autoridade imediata
- Combine o link visual com copy de impacto + urgência + valor percebido
- Mantenha tom curto, impactante, confiante — não seja genérico
- Adapte linguagem ao canal: Instagram = mais visual, linguagem de stories; WhatsApp = mais direta, informal
</visual_strategy>
    `;

	// Adicionar contexto personalizado se disponível
	if (context.user?.name) {
		instruction += `\n\nCONTEXTO DO USUÁRIO:\n- Nome: ${context.user.name}`;
	}
	if (context.user?.location) {
		instruction += `\n- Localização: ${context.user.location}`;
	}
	if (context.projectStage) {
		instruction += `\n- Estágio do projeto: ${context.projectStage}`;
	}
	
	// Adicionar histórico da conversa se disponível (formato GPT-5)
	if (context.history && Array.isArray(context.history) && context.history.length > 0) {
		instruction += `\n\n<conversation_history>\n`;
		instruction += `Histórico da conversa (use para manter contexto e não repetir):\n\n`;
		context.history.forEach((msg: any, index: number) => {
			if (msg.role && msg.content) {
				instruction += `${index + 1}. ${msg.role === "user" ? "[USER]" : "[YOU]"}: ${msg.content}\n`;
			}
		});
		instruction += `\nREGRAS CRÍTICAS COM BASE NO HISTÓRICO:\n`;
		instruction += `- Se o usuário já mencionou interesse em site/projeto, NÃO pergunte "o que te trouxe aqui" novamente\n`;
		instruction += `- Se o usuário já respondeu uma pergunta de diagnóstico, NÃO faça a mesma pergunta novamente\n`;
		instruction += `- Se o usuário disse "nada" ou demonstrou desinteresse, mude de abordagem imediatamente\n`;
		instruction += `- Use as informações do histórico para fazer perguntas mais específicas e avançadas\n`;
		instruction += `</conversation_history>\n`;
	}

	return await AgentBuilder.create("flowcloser")
		.withModel(model)
		.withDescription(
			"Closer digital especializado em vendas de presença digital",
		)
		.withInstruction(instruction)
		.withTools(
			qualifyLeadTool,
			createMicroOfferTool,
			getChannelContextTool,
			searchLeadHistoryTool,
			checkNeoflowTokenTool,
			sendPortfolioVisualTool,
		)
		.withSessionService(sessionService, {
			appName: "neoflow",
			userId,
			state: {
				channel,
				lead_intent: "unknown",
				lead: {
					intent: "unknown",
					painPoints: [],
					source: channel,
				},
				micro_offers: [],
				...context, // Merge contexto adicional no estado
			},
		})
		.withBeforeModelCallback(guardrailsCallback)
		.build();
}

export async function agent() {
	const model = process.env.LLM_MODEL || "gpt-4o";
	return await createAgentWithModel(model);
}

interface AskOptions {
	channel?: string;
	userId?: string;
	context?: AgentContext;
}

/**
 * Detecta o estágio do lead baseado na mensagem
 */
function detectLeadStage(message: string): "opening" | "diagnosis" | "proposal" | "conversion" | "closed" {
	const msg = message.toLowerCase();
	
	if (msg.includes("quero") || msg.includes("preciso") || msg.includes("orçamento") || msg.includes("preço")) {
		return "conversion";
	}
	if (msg.includes("como") || msg.includes("quando") || msg.includes("quanto tempo") || msg.includes("prazo")) {
		return "proposal";
	}
	if (msg.includes("sim") || msg.includes("ok") || msg.includes("vamos") || msg.includes("fechar")) {
		return "closed";
	}
	if (msg.includes("projeto") || msg.includes("site") || msg.includes("app") || msg.includes("sistema")) {
		return "diagnosis";
	}
	
	return "opening";
}

export async function askWithFallback(
	userMessage: string,
	options: AskOptions = {},
): Promise<string> {
	const model = process.env.LLM_MODEL || "gpt-4o";
	const fallbackModel = process.env.LLM_MODEL_FALLBACK || "gemini-2.5-flash";
	const { channel, userId, context = {} } = options;

	// Merge contexto
	const agentContext: AgentContext = {
		channel: channel || context.channel || "instagram",
		userId: userId || context.userId,
		...context,
	};

	let agentResponse: string;
	let usedModel = model;
	let fallbackUsed = false;

	try {
		console.log(`🤖 Using primary model: ${model}`);
		
		// Detectar estágio do lead baseado na mensagem
		const leadStage = detectLeadStage(userMessage);
		await logLeadStage(leadStage, {
			channel: agentContext.channel,
			userId: agentContext.userId,
		});
		
		const { runner } = await createAgentWithModel(model, agentContext);
		agentResponse = await runner.ask(userMessage);
		
		// Verificar se a resposta contém erro (ADK pode retornar erro como string)
		if (typeof agentResponse === "string" && agentResponse.startsWith("Error:")) {
			throw new Error(agentResponse);
		}

		// Callback pós-resposta (simulado, já que ADK não tem afterModelCallback nativo)
		await afterModelCallback({
			callbackContext: {
				state: agentContext as any,
				input: { message: userMessage },
			} as any,
			llmRequest: { model } as any,
			llmResponse: agentResponse as any,
		});

		// Log da resposta com detecção de portfólio
		await logAgentResponse(agentResponse, {
			stage: "Response",
			channel: agentContext.channel,
			userId: agentContext.userId,
			model: usedModel,
		});
	} catch (error) {
		console.warn(`⚠️ Primary model (${model}) failed. Falling back to: ${fallbackModel}`);
		console.error("Error:", error instanceof Error ? error.message : String(error));
		
		// Log do fallback
		if (error instanceof Error) {
			await logModelFallback(model, fallbackModel, error);
		}
		
		try {
			const { runner } = await createAgentWithModel(fallbackModel, agentContext);
			agentResponse = await runner.ask(userMessage);
			usedModel = fallbackModel;
			fallbackUsed = true;
			
			// Verificar novamente se há erro no fallback
			if (typeof agentResponse === "string" && agentResponse.startsWith("Error:")) {
				throw new Error(agentResponse);
			}
			
			console.log(`✅ Fallback model (${fallbackModel}) succeeded`);

			// Callback pós-resposta para fallback
			await afterModelCallback({
				callbackContext: {
					state: agentContext as any,
					input: { message: userMessage },
				} as any,
				llmRequest: { model: fallbackModel } as any,
				llmResponse: agentResponse as any,
			});

			// Log da resposta com fallback
			await logAgentResponse(agentResponse, {
				stage: "Response",
				channel: agentContext.channel,
				userId: agentContext.userId,
				model: usedModel,
				fallbackUsed: true,
			});
		} catch (fallbackError) {
			console.error("❌ Fallback model also failed:", fallbackError);
			throw new Error(
				`Both models failed. Primary: ${error instanceof Error ? error.message : String(error)}. Fallback: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
			);
		}
	}

	return typeof agentResponse === "string" ? agentResponse : JSON.stringify(agentResponse);
}
