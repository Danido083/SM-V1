// Tipos do domínio de Catálogo

export interface Product {
  /** Sempre string — evita key mismatch silencioso em Record<string, number> */
  id: string;
  name: string;
  img: string;
  tag?: string;
  description?: string;
  category: string;
}

export interface LeadData {
  name: string;
  whatsapp: string;
  city: string;
}
