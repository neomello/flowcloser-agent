import { Router } from "express";
import { listLeads, getLeadMetrics } from "../services/leads.js";

const router = Router();

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

router.get("/api/leads", async (req, res) => {
    try {
        const filters = {
            account_name: (req.query.account_name as string) || undefined,
            page_id: (req.query.page_id as string) || undefined,
            platform: (req.query.platform as string) || undefined,
            status: (req.query.status as string) || undefined,
            from: normalizeDateParam(req.query.from as any),
            to: normalizeDateParam(req.query.to as any),
            limit: req.query.limit ? Number(req.query.limit) : 100,
        };

        const [leadResult, metrics] = await Promise.all([
            listLeads(filters),
            getLeadMetrics(filters),
        ]);

        res.json({
            data: leadResult.leads,
            count: leadResult.count,
            metrics,
            filters,
            storage: "ipfs_storacha",
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to list leads" });
    }
});

router.get("/dashboard", async (req, res) => {
    try {
        const storachaConfigured = Boolean(process.env.STORACHA_UCAN || process.env.STORACHA_SPACE_DID);
        const filters = {
            account_name: (req.query.account_name as string) || undefined,
            status: (req.query.status as string) || undefined,
            platform: (req.query.platform as string) || undefined,
            from: normalizeDateParam(req.query.from as any),
            to: normalizeDateParam(req.query.to as any),
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
				<td>${lead.qualified ? "✅" : "–"}</td>
				<td>${escapeHtml(lead.project_type || "-")}</td>
				<td>${formatDate(lead.created_at)}</td>
			</tr>
		`).join("");

        res.send(`
			<!doctype html>
			<html lang="pt-BR">
			<head>
				<meta charset="utf-8" />
				<title>Leads | FlowCloser</title>
				<style>
					body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
					table { width: 100%; border-collapse: collapse; margin-top: 20px; }
					th, td { padding: 12px; border-bottom: 1px solid #1e293b; text-align: left; }
					.card { background: #1e293b; padding: 15px; border-radius: 8px; display: inline-block; margin-right: 10px; }
				</style>
			</head>
			<body>
				<h1>Dashboard de Leads</h1>
				<div class="card">Total: ${metrics.total}</div>
				<div class="card">Qualificados: ${metrics.qualified}</div>
				<table>
					<thead>
						<tr>
							<th>Nome</th><th>Empresa</th><th>Score</th><th>Status</th><th>Conta</th><th>Plataforma</th><th>Qualificado</th><th>Projeto</th><th>Data</th>
						</tr>
					</thead>
					<tbody>${rows}</tbody>
				</table>
				<script>setTimeout(() => window.location.reload(), 30000);</script>
			</body>
			</html>
		`);
    } catch (error) {
        res.status(500).send("Erro ao carregar dashboard");
    }
});

export default router;
