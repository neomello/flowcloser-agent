import { describe, it, expect } from 'vitest';
import { computeLeadScore, extractLeadDataFromMessage } from './leads.js';

describe('Leads Service', () => {
    describe('computeLeadScore', () => {
        it('should calculate base score correctly', () => {
            const score = computeLeadScore({});
            expect(score).toBe(50);
        });

        it('should add points for intent', () => {
            const score = computeLeadScore({ intent: 'interested' });
            expect(score).toBe(60);
        });

        it('should add extra points for urgency', () => {
            const score = computeLeadScore({ urgency: 'urgente' });
            expect(score).toBe(60);
        });

        it('should cap score at 100', () => {
            const score = computeLeadScore({
                intent: 'buy',
                budget: 'high',
                timeline: 'now',
                painPoints: ['slow'],
                qualified: true,
                urgency: 'urgente'
            });
            expect(score).toBe(100);
        });
    });

    describe('extractLeadDataFromMessage', () => {
        it('should extract project type from message', () => {
            const data = extractLeadDataFromMessage('Quero um webapp novo');
            expect(data.projectType).toBe('webapp');
        });

        it('should extract urgency from message', () => {
            const data = extractLeadDataFromMessage('Preciso disso urgente para amanhã');
            expect(data.urgency).toBe('urgent');
        });

        it('should extract name using common patterns', () => {
            const data = extractLeadDataFromMessage('Olá, meu nome é João');
            expect(data.name).toBe('João');
        });

        it('should extract intent when user mentions updating', () => {
            const data = extractLeadDataFromMessage('Gostaria de atualizar meu site');
            expect(data.intent).toBe('update');
            expect(data.projectType).toBe('site');
        });
    });
});
