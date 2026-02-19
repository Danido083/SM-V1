/**
 * @file src/features/checkout/hooks/useOrderSubmit.ts
 * @description Hook responsável por toda a lógica de submissão de pedido:
 *   1. Monta o payload
 *   2. Envia para a API (Google Apps Script)
 *   3. Redireciona para o WhatsApp
 * App.tsx não precisa saber COMO nada disso acontece.
 */

import { useState, useCallback } from 'react';
import { Product, LeadData } from '../../catalog/types';
import { buildWhatsAppLink, OrderItem } from '../utils/whatsapp';
import { WHATSAPP_NUMBER } from '../../../config/constants';

const API_URL = import.meta.env.VITE_API_URL as string;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface UseOrderSubmitOptions {
    /** Chamado quando o pedido é enviado com sucesso (exibir toast, limpar estado, etc.). */
    onSuccess?: () => void;
    /** Chamado em caso de falha na requisição. */
    onError?: (err: unknown) => void;
}

export interface UseOrderSubmitReturn {
    /** Envia o pedido. Retorna `true` em sucesso, `false` em falha. */
    submit: (lead: LeadData) => Promise<boolean>;
    /** `true` enquanto a requisição está em andamento. */
    isSubmitting: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrderSubmit(
    products: Product[],
    cart: Record<string | number, number>,
    options: UseOrderSubmitOptions = {},
): UseOrderSubmitReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = useCallback(
        async (lead: LeadData): Promise<boolean> => {
            setIsSubmitting(true);

            // Filtra apenas os produtos que estão no carrinho
            const items: OrderItem[] = products
                .filter((p) => (cart[p.id] ?? 0) > 0)
                .map((p) => ({
                    nome: p.name,
                    quantidade: cart[p.id],
                    categoria: p.category,
                }));

            const payload = {
                lead,
                pedido: items,
                data: new Date().toISOString(),
            };

            try {
                await fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

                // Monta o link do WhatsApp usando o utilitário puro
                const whatsappUrl = buildWhatsAppLink(WHATSAPP_NUMBER, lead, items);

                // Pequeno delay para o toast ser exibido antes de abrir o WhatsApp
                setTimeout(() => window.open(whatsappUrl, '_blank'), 1000);

                options.onSuccess?.();
                return true;
            } catch (err) {
                options.onError?.(err);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [products, cart, options],
    );

    return { submit, isSubmitting };
}
