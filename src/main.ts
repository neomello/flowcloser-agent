// IMPORTAR PRIMEIRO - garante que crypto esteja disponível antes do @iqai/adk
import "./crypto-polyfill.js";

import express from "express";
import * as dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Routes
import dashboardRoutes from "./routes/dashboard.js";
import webhookRoutes from "./routes/webhooks.js";
import { privacyPolicy, termsOfService } from "./routes/legal.js";
import { dataDeletionCallback, dataDeletionStatus } from "./routes/data-deletion.js";
import { askWithFallback } from "./agents/flowcloser/agent.js";

// Forçar uso do .env
dotenv.config({ override: true });

const app = express();
const PORT = Number(process.env.PORT) || 8042;

// Middleware
app.use(express.json({
	verify: (req, _res, buf) => {
		(req as any).rawBody = buf;
	},
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Swagger Config
const swaggerOptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "FlowCloser Agent API",
			version: "1.0.0",
			description: "API para o agente FlowCloser - Modularizada",
		},
		servers: [
			{
				url: process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : "http://localhost:8042",
				description: "Servidor Principal",
			},
		],
	},
	apis: ["./src/main.ts", "./dist/main.js", "./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Registrar Rotas Modularizadas
app.use("/", dashboardRoutes);
app.use("/api/webhooks", webhookRoutes);

// Rotas Legais
app.get("/privacy-policy", privacyPolicy);
app.get("/terms-of-service", termsOfService);
app.post("/api/data-deletion", dataDeletionCallback);
app.get("/data-deletion-status", dataDeletionStatus);

// Middleware de Erro Global (Deve ser o último)
import { errorHandler } from "./middleware/error-handler.js";
app.use(errorHandler);

// Agents API
app.get("/api/agents", (req, res) => {
	res.json({ agents: ["flowcloser"], status: "ok" });
});

app.post("/api/agents/flowcloser/message", async (req, res, next) => {
	try {
		const { message, sessionId, channel, userId, context } = req.body;
		if (!message) {
			const { ValidationError } = await import("./utils/errors.js");
			throw new ValidationError("Message is required");
		}

		const response = await askWithFallback(message, {
			channel: channel || "api",
			userId: userId || sessionId || "default",
			context: context || {},
		});

		res.json({ response, sessionId: sessionId || "default" });
	} catch (error) {
		next(error);
	}
});

// Exportar para testes
export { app };

// Iniciar Servidor
app.listen(PORT, "0.0.0.0", () => {
	console.log(`🚀 FlowCloser API running on port ${PORT}`);
	console.log(`📍 Swagger: http://localhost:${PORT}/api-docs`);
});
