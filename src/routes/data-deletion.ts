import { Request, Response } from "express";
import * as crypto from "node:crypto";
import * as dotenv from "dotenv";

dotenv.config({ override: true });

/**
 * Parse signed_request do Meta/Facebook
 * Formato: <signature>.<payload>
 */
function parseSignedRequest(signedRequest: string): { user_id: string; algorithm: string; expires: number; issued_at: number } | null {
	const appSecret = process.env.INSTAGRAM_APP_SECRET;
	
	if (!appSecret) {
		console.error("❌ INSTAGRAM_APP_SECRET não configurado");
		return null;
	}

	try {
		// Dividir em signature e payload
		const parts = signedRequest.split(".");
		if (parts.length !== 2) {
			console.error("❌ Formato inválido de signed_request");
			return null;
		}

		const [encodedSig, payload] = parts;

		// Decodificar payload
		const decodedPayload = base64UrlDecode(payload);
		const data = JSON.parse(decodedPayload) as {
			user_id?: string;
			algorithm?: string;
			expires?: number;
			issued_at?: number;
		};

		// Verificar assinatura
		const sig = base64UrlDecode(encodedSig);
		const expectedSig = crypto
			.createHmac("sha256", appSecret)
			.update(payload)
			.digest();

		if (!crypto.timingSafeEqual(Buffer.from(sig), expectedSig)) {
			console.error("❌ Assinatura inválida no signed_request");
			return null;
		}

		// Verificar expiração
		if (data.expires && data.expires < Math.floor(Date.now() / 1000)) {
			console.error("❌ signed_request expirado");
			return null;
		}

		if (!data.user_id) {
			console.error("❌ user_id não encontrado no signed_request");
			return null;
		}

		return {
			user_id: data.user_id,
			algorithm: data.algorithm || "HMAC-SHA256",
			expires: data.expires || 0,
			issued_at: data.issued_at || 0,
		};
	} catch (error) {
		console.error("❌ Erro ao parsear signed_request:", error);
		return null;
	}
}

/**
 * Decodifica base64 URL-safe
 */
function base64UrlDecode(input: string): string {
	// Substituir caracteres URL-safe
	const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
	
	// Adicionar padding se necessário
	const pad = base64.length % 4;
	const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;
	
	return Buffer.from(paddedBase64, "base64").toString("utf-8");
}

/**
 * Gera código de confirmação único
 */
function generateConfirmationCode(): string {
	return crypto.randomBytes(8).toString("hex").toUpperCase();
}

/**
 * Endpoint POST para Data Deletion Request Callback
 * Meta envia POST com signed_request quando usuário solicita exclusão
 */
export async function dataDeletionCallback(req: Request, res: Response): Promise<void> {
	try {
		const signedRequest = req.body.signed_request;

		if (!signedRequest) {
			console.error("❌ signed_request não fornecido");
			res.status(400).json({
				error: "signed_request is required",
			});
			return;
		}

		// Parsear signed_request
		const data = parseSignedRequest(signedRequest);

		if (!data) {
			console.error("❌ Falha ao parsear signed_request");
			res.status(400).json({
				error: "Invalid signed_request",
			});
			return;
		}

		const userId = data.user_id;
		const confirmationCode = generateConfirmationCode();

		console.log(`🗑️ Data deletion request received for user: ${userId}`);
		console.log(`📝 Confirmation code: ${confirmationCode}`);

		// TODO: Implementar lógica de exclusão de dados aqui
		// Por exemplo:
		// - Deletar sessões do banco de dados
		// - Deletar histórico de conversas
		// - Deletar dados de usuário associados
		// - Log da exclusão para auditoria

		// Por enquanto, apenas logamos
		console.log(`✅ Data deletion initiated for user ${userId}`);

		// URL para o usuário verificar o status
		const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN || 
		                process.env.RAILWAY_URL?.replace("/project/", "") || 
		                "https://flowcloser-agent-production.up.railway.app";
		const statusUrl = `${baseUrl}/data-deletion-status?code=${confirmationCode}&user_id=${userId}`;

		// Retornar resposta JSON conforme especificação do Meta
		res.json({
			url: statusUrl,
			confirmation_code: confirmationCode,
		});
	} catch (error) {
		console.error("❌ Erro no data deletion callback:", error);
		res.status(500).json({
			error: "Internal server error",
			message: error instanceof Error ? error.message : String(error),
		});
		return;
	}
}

/**
 * Página de status de exclusão de dados
 * Usuário acessa com código de confirmação para verificar status
 */
export function dataDeletionStatus(req: Request, res: Response): void {
	const { code, user_id } = req.query;
	const currentDate = new Date().toLocaleDateString("pt-BR");

	if (!code || !user_id) {
		res.status(400).send(`
			<!DOCTYPE html>
			<html lang="pt-BR">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Erro - Status de Exclusão</title>
				<style>
					body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
					.error { background: white; padding: 30px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 10px rgba(0,0,0,0.1); color: #d32f2f; }
				</style>
			</head>
			<body>
				<div class="error">
					<h2>❌ Parâmetros inválidos</h2>
					<p>Código de confirmação ou ID de usuário não fornecido.</p>
				</div>
			</body>
			</html>
		`);
	}

	res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status de Exclusão de Dados - FlowCloser</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo-container {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .logo-container img {
            max-width: 200px;
            height: auto;
            margin: 10px 20px;
        }
        .logo-agencia {
            max-width: 150px;
        }
        .logo-app {
            max-width: 180px;
        }
        h1 { 
            color: #1a73e8; 
            margin-top: 0;
        }
        .status-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .code-box {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 18px;
            text-align: center;
            margin: 20px 0;
            color: #1a73e8;
            font-weight: bold;
        }
        .info-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            color: #5f6368;
            font-size: 14px;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <img src="/images/flowoff_logo.png" alt="FlowOff Logo" class="logo-agencia">
            <img src="/images/NEOFLOW.png" alt="NEOFLOW Logo" class="logo-app">
        </div>
        <h1>Status de Exclusão de Dados</h1>
        <p style="color: #5f6368; font-size: 14px;">Última atualização: ${currentDate}</p>
        
        <div class="status-box">
            <h2 style="margin-top: 0; color: #1976d2;">✅ Solicitação Recebida</h2>
            <p>Sua solicitação de exclusão de dados foi recebida e está sendo processada.</p>
        </div>

        <div class="code-box">
            Código de Confirmação: ${code}
        </div>

        <div class="info-box">
            <h3 style="margin-top: 0;">📋 Informações da Solicitação</h3>
            <ul style="margin-bottom: 0;">
                <li><strong>ID do Usuário:</strong> ${user_id}</li>
                <li><strong>Código de Confirmação:</strong> ${code}</li>
                <li><strong>Data da Solicitação:</strong> ${currentDate}</li>
                <li><strong>Status:</strong> Em processamento</li>
            </ul>
        </div>

        <h2>O que acontece agora?</h2>
        <p>Nossa equipe está processando sua solicitação de exclusão de dados. Os seguintes dados serão excluídos:</p>
        <ul>
            <li>Histórico de conversas via Instagram</li>
            <li>Sessões e dados de contexto armazenados</li>
            <li>Informações de qualificação de leads</li>
            <li>Dados de perfil associados à sua conta</li>
        </ul>

        <div class="info-box">
            <h3 style="margin-top: 0;">⏱️ Tempo de Processamento</h3>
            <p>O processamento geralmente leva até <strong>30 dias</strong> para ser concluído. Você receberá uma confirmação quando a exclusão for finalizada.</p>
        </div>

        <h2>Precisa de ajuda?</h2>
        <p>Se tiver dúvidas sobre sua solicitação de exclusão de dados:</p>
        <ul>
            <li><strong>Email:</strong> privacy@flowoff.xyz</li>
            <li><strong>Instagram:</strong> Envie mensagem direta para nosso perfil</li>
        </ul>

        <hr>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} NΞØ Protocol - FlowCloser. Todos os direitos reservados.</p>
            <p>Built onchain. Powered by $NEOFLW.</p>
            <p style="margin-top: 10px;">// 🪩 By NEØ PROTOCOL™ //</p>
        </div>
    </div>
</body>
</html>
	`);
}

