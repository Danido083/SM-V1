/**
 * @file src/features/checkout/hooks/useOrderSubmit.ts
 * @description Hook responsável por toda a lógica de submissão de pedido:
 *   1. Salva/verifica o revendedor no Supabase
 *   2. Salva o pedido com itens detalhados (para analytics futuros)
 *   3. SEMPRE redireciona para o WhatsApp — mesmo se o Supabase falhar
 *
 * Protocolo de segurança de negócio:
 *   ↳ try   → salva no Supabase
 *   ↳ catch → loga o erro (invisível ao usuário)
 *   ↳ finally → WhatsApp SEMPRE dispara (venda nunca é perdida)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Product, LeadData } from '../../catalog/types';
import { buildWhatsAppLink, OrderItem } from '../utils/whatsapp';
import { WHATSAPP_NUMBER } from '../../../config/constants';
import { supabase } from '../../../lib/supabase';

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

// ─── Tipo enriquecido para analytics ─────────────────────────────────────────

interface ItemJson {
    id: string;
    nome: string;
    quantidade: number;
    categoria: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrderSubmit(
    products: Product[],
    cart: Record<string, number>,
    options: UseOrderSubmitOptions = {},
): UseOrderSubmitReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── Stable Event Handler ─────────────────────────────────────────────────
    const onSuccessRef = useRef(options.onSuccess);
    const onErrorRef = useRef(options.onError);
    useEffect(() => { onSuccessRef.current = options.onSuccess; });
    useEffect(() => { onErrorRef.current = options.onError; });

    // ─── submit ───────────────────────────────────────────────────────────────
    const submit = useCallback(
        async (lead: LeadData): Promise<boolean> => {
            setIsSubmitting(true);

            // Itera os produtos uma única vez e gera os dois formatos em paralelo
            // (antes havia dois .filter().map() separados — custo duplo sem necessidade)
            const items: OrderItem[] = [];
            const itensJson: ItemJson[] = [];

            for (const p of products) {
                const quantidade = cart[p.id] ?? 0;
                if (quantidade <= 0) continue;
                items.push({ nome: p.name, quantidade, categoria: p.category });
                itensJson.push({ id: p.id, nome: p.name, quantidade, categoria: p.category });
            }

            const whatsappUrl = buildWhatsAppLink(WHATSAPP_NUMBER, lead, items);

            let dbSuccess = false;

            try {
                // Configura um timeout limite de 5 segundos para o Supabase
                // Isso evita que a interface trave se a rede cair ou o DB demorar.
                const dbPromise = (async () => {
                    // ── Passo 1: Salva/atualiza o revendedor ───────────────────────
                    const { data: revendedor, error: errRevendedor } = await supabase
                        .from('revendedores')
                        .upsert(
                            {
                                nome: lead.name,
                                whatsapp: lead.whatsapp,
                                cidade: lead.city,
                            },
                            { onConflict: 'whatsapp', ignoreDuplicates: false },
                        )
                        .select('id')
                        .single();

                    if (errRevendedor) throw errRevendedor;

                    // ── Passo 2: Registra o pedido com validação extra ──────────────
                    // Proteção extra do front-end garantindo valores inteiros e > 0
                    const validItensJson = itensJson
                        .filter(i => Number.isInteger(i.quantidade) && i.quantidade > 0)

                    if (validItensJson.length === 0) throw new Error("Carrinho vazio manipulado");

                    const { error: errPedido } = await supabase
                        .from('pedidos_b2b')
                        .insert({
                            revendedor_id: revendedor.id,
                            itens_json: validItensJson,
                            total_itens: validItensJson.reduce((acc, i) => acc + i.quantidade, 0),
                            status: 'pendente',
                        });

                    if (errPedido) throw errPedido;
                    return true;
                })();

                const timeoutPromise = new Promise<boolean>((_, reject) =>
                    setTimeout(() => reject(new Error('Supabase Timeout')), 5000)
                );

                dbSuccess = await Promise.race([dbPromise, timeoutPromise]);
                onSuccessRef.current?.();
            } catch (err) {
                // Erro silencioso (Timeouts, Falhas de Rede, Manipulação)
                console.error('[Mauriti] Falha não impeditiva no Supabase:', err);
                onErrorRef.current?.(err);

            } finally {
                // ────────────────────────────────────────────────────────────────
                // PROTOCOLO DE SEGURANÇA: WhatsApp SEMPRE dispara.
                // A venda nunca é perdida, independente do estado do banco.
                // ────────────────────────────────────────────────────────────────
                // Usa window.location.href em vez de window.open para garantir
                // redirecionamento 100% funcional em mobile (iOS Safari / Chrome Mobile).
                // window.open em contexto assíncrono é bloqueado como pop-up pelo browser.
                setTimeout(() => { window.location.href = whatsappUrl; }, 800);
                setIsSubmitting(false);
            }

            return dbSuccess;
        },
        [products, cart],
    );

    return { submit, isSubmitting };
}
