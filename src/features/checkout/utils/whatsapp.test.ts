/**
 * @file src/features/checkout/utils/whatsapp.test.ts
 * @description Testes unitários para as funções puras de geração de link WhatsApp.
 *
 * Para rodar:
 *   npm run test
 *
 * Para instalar o vitest (se ainda não estiver no projeto):
 *   npm install -D vitest
 *   // Adicione ao package.json scripts: "test": "vitest"
 */

import { describe, it, expect } from 'vitest';
import { formatOrderItems, buildWhatsAppMessage, buildWhatsAppLink } from './whatsapp';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockLead = { name: 'João Silva', whatsapp: '88999990000', city: 'Mauriti - CE' };

const mockItems = [
    { nome: 'Picolé de Limão', quantidade: 48, categoria: 'picole' },
    { nome: 'Açaí 1L', quantidade: 12, categoria: 'acai' },
];

// ─── formatOrderItems ─────────────────────────────────────────────────────────

describe('formatOrderItems', () => {
    it('formata uma lista de itens corretamente', () => {
        const result = formatOrderItems(mockItems);
        expect(result).toBe('• 48x Picolé de Limão\n• 12x Açaí 1L');
    });

    it('retorna string vazia para lista vazia', () => {
        expect(formatOrderItems([])).toBe('');
    });
});

// ─── buildWhatsAppMessage ─────────────────────────────────────────────────────

describe('buildWhatsAppMessage', () => {
    it('inclui nome do cliente na mensagem', () => {
        const msg = buildWhatsAppMessage(mockLead, mockItems);
        expect(msg).toContain('João Silva');
    });

    it('inclui cidade do cliente na mensagem', () => {
        const msg = buildWhatsAppMessage(mockLead, mockItems);
        expect(msg).toContain('Mauriti - CE');
    });

    it('inclui os itens do pedido na mensagem', () => {
        const msg = buildWhatsAppMessage(mockLead, mockItems);
        expect(msg).toContain('48x Picolé de Limão');
        expect(msg).toContain('12x Açaí 1L');
    });

    it('começa com o cabeçalho padrão de Orçamento B2B', () => {
        const msg = buildWhatsAppMessage(mockLead, mockItems);
        expect(msg).toContain('Novo Orçamento B2B');
    });
});

// ─── buildWhatsAppLink ────────────────────────────────────────────────────────

describe('buildWhatsAppLink', () => {
    it('gera URL iniciando com https://wa.me/', () => {
        const url = buildWhatsAppLink('558899310129', mockLead, mockItems);
        expect(url).toMatch(/^https:\/\/wa\.me\/558899310129/);
    });

    it('contém ?text= na URL', () => {
        const url = buildWhatsAppLink('558899310129', mockLead, mockItems);
        expect(url).toContain('?text=');
    });

    it('a mensagem está URL-encoded (sem espaços)', () => {
        const url = buildWhatsAppLink('558899310129', mockLead, mockItems);
        const textParam = url.split('?text=')[1];
        expect(textParam).not.toContain(' ');
    });
});
