import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from './main.js';

// Mock agents to avoid actual LLM calls during health/basic tests
vi.mock('./agents/flowcloser/agent.js', () => ({
    agent: vi.fn(),
    askWithFallback: vi.fn().mockResolvedValue('Resposta simulada')
}));

describe('Integration Tests', () => {
    describe('GET /health', () => {
        it('should return 200 and ok status', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /api/agents', () => {
        it('should list agents', async () => {
            const response = await request(app).get('/api/agents');
            expect(response.status).toBe(200);
            expect(response.body.agents).toContain('flowcloser');
        });
    });

    describe('POST /api/agents/flowcloser/message', () => {
        it('should require a message', async () => {
            const response = await request(app)
                .post('/api/agents/flowcloser/message')
                .send({});
            expect(response.status).toBe(400);
        });

        it('should return agent response when message is provided', async () => {
            const response = await request(app)
                .post('/api/agents/flowcloser/message')
                .send({ message: 'Olá agent' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('response', 'Resposta simulada');
        });
    });
});
