/**
 * @file src/features/checkout/utils/whatsapp.ts
 * @description Utilitários puros para geração de mensagens e links do WhatsApp.
 * Funções puras = 100% testáveis sem React ou ambiente de browser.
 */

export interface OrderItem {
  nome: string;
  quantidade: number;
  categoria?: string;
}

export interface LeadInfo {
  name: string;
  whatsapp: string;
  city: string;
}

/**
 * Formata a lista de itens do pedido em texto legível para o WhatsApp.
 */
export function formatOrderItems(items: OrderItem[]): string {
  return items.map((i) => `• ${i.quantidade}x ${i.nome}`).join('\n');
}

/**
 * Monta o corpo da mensagem de orçamento B2B.
 */
export function buildWhatsAppMessage(lead: LeadInfo, items: OrderItem[]): string {
  const orderText = formatOrderItems(items);
  return (
    `🚀 *Novo Orçamento B2B*\n\n` +
    `*Cliente:* ${lead.name}\n` +
    `*WhatsApp:* ${lead.whatsapp}\n` +
    `*Cidade:* ${lead.city}\n\n` +
    `*Pedido:*\n${orderText}\n\n` +
    `Aguardo contato!`
  );
}

/**
 * Gera a URL completa para abertura do WhatsApp com a mensagem pré-preenchida.
 * @param phoneNumber - Número no formato E.164, sem o "+" (ex: "558899310129")
 */
export function buildWhatsAppLink(phoneNumber: string, lead: LeadInfo, items: OrderItem[]): string {
  const message = buildWhatsAppMessage(lead, items);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}
